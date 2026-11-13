/**
 * API configuration and helper services for SandboxForge
 */

// Default local backend host for management APIs
export const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? '/api' 
  : 'http://localhost/api';

/**
 * Dynamic Agent URL generators based on sandboxId
 */
export const getAgentHost = (sandboxId) => {
  if (!sandboxId) return '';
  return `http://${sandboxId}.agent.localhost`;
};

export const getListFilesUrl = (sandboxId) => {
  return `${getAgentHost(sandboxId)}/list-files`;
};

export const getReadFilesUrl = (sandboxId, filePath) => {
  // Strip leading slash if query param expects relative or normalized
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  return `${getAgentHost(sandboxId)}/read-files?files=${encodeURIComponent(cleanPath)}`;
};

export const getUpdateFilesUrl = (sandboxId) => {
  return `${getAgentHost(sandboxId)}/update-files`;
};

export const getAiInvokeUrl = () => {
  // Can be called via proxy /api/ai/invoke or directly http://localhost/api/ai/invoke
  return `${API_BASE}/ai/invoke`;
};

export const getSandboxStartUrl = () => {
  return `${API_BASE}/sandbox/start`;
};

/**
 * 1. Start Sandbox
 * POST http://localhost/api/sandbox/start
 */
export async function startSandboxApi() {
  const urlsToTry = [
    '/api/sandbox/start',
    
  ];

  let lastError = null;

  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      lastError = err;
      // If we tried the relative proxy URL and failed, try the absolute URL next
    }
  }

  throw lastError || new Error('Failed to reach sandbox creation API at http://localhost/api/sandbox/start');
}

/**
 * 2. List Files
 * GET http://<sandboxId>.agent.localhost/list-files
 */
export async function listFilesApi(sandboxId) {
  if (!sandboxId) throw new Error('Sandbox ID is required to list files');
  const url = getListFilesUrl(sandboxId);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list files (${response.status}): ${response.statusText}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * 3. Read Files
 * GET http://<sandboxId>.agent.localhost/read-files?files=<path>
 * Response format:
 * {
 *   "message": "File contents",
 *   "files": [
 *     { "/src/App.css": "content..." }
 *   ]
 * }
 */
export async function readFileApi(sandboxId, filePath) {
  if (!sandboxId) throw new Error('Sandbox ID is required to read files');
  const url = getReadFilesUrl(sandboxId, filePath);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to read file ${filePath} (${response.status}): ${response.statusText}`);
  }

  const data = await response.json();

  // Normalize path with leading and without leading slash to locate content in the returned map
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const slashedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;

  let content = '';

  if (Array.isArray(data.files) && data.files.length > 0) {
    const fileObj = data.files[0];
    if (fileObj) {
      if (typeof fileObj[slashedPath] === 'string') {
        content = fileObj[slashedPath];
      } else if (typeof fileObj[cleanPath] === 'string') {
        content = fileObj[cleanPath];
      } else {
        // Fallback: take the first value in the object if any
        const keys = Object.keys(fileObj);
        if (keys.length > 0 && typeof fileObj[keys[0]] === 'string') {
          content = fileObj[keys[0]];
        }
      }
    }
  }

  return content;
}

/**
 * 4. Update Files
 * PATCH http://<sandboxId>.agent.localhost/update-files
 * Body:
 * {
 *   "updates": [
 *     { "file": "/src/App.css", "content": "..." }
 *   ]
 * }
 */
export async function updateFileApi(sandboxId, filePath, content) {
  if (!sandboxId) throw new Error('Sandbox ID is required to update files');
  const url = getUpdateFilesUrl(sandboxId);

  // Normalize path to have leading slash as shown in the spec: "/src/App.css"
  const normalizedFile = filePath.startsWith('/') ? filePath : `/${filePath}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      updates: [
        {
          file: normalizedFile,
          content: content,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update file ${filePath} (${response.status}): ${errorText || response.statusText}`);
  }

  return await response.json();
}

/**
 * 5. AI Chat Stream (SSE)
 * POST http://localhost/api/ai/invoke
 * Body: { message: "...", projectId: sandboxId }
 *
 * onEvent: callback for each parsed event/line
 */
export async function invokeAiStream(sandboxId, message, onEvent) {
  if (!sandboxId) throw new Error('Sandbox ID is required to invoke AI assistant');

  const urlsToTry = [
    '/api/ai/invoke',
    'http://localhost/api/ai/invoke'
  ];

  let response = null;
  let lastError = null;

  for (const url of urlsToTry) {
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream, application/json, text/plain',
        },
        body: JSON.stringify({
          message: message,
          projectId: sandboxId,
        }),
      });

      if (response.ok) break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!response || !response.ok) {
    throw lastError || new Error(`AI invocation failed: ${response ? response.statusText : 'Connection error'}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || ''; // Keep incomplete trailing line

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        onEvent({ type: 'empty', raw: '' });
        continue;
      }

      // Check if it's SSE 'data: ...' format
      let payload = line;
      if (line.startsWith('data:')) {
        payload = line.slice(5).trim();
      }

      // Identify event content
      if (payload === '(empty)' || payload === '') {
        onEvent({ type: 'empty', raw: payload });
      } else if (/^\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(payload)) {
        onEvent({ type: 'timestamp', time: payload, raw: payload });
      } else if (payload.startsWith('Reading files...')) {
        const files = payload.replace('Reading files...', '').trim().split(',').map(f => f.trim()).filter(Boolean);
        onEvent({ type: 'reading_files', files, message: payload, raw: payload });
      } else if (payload.includes('Files read successfully')) {
        onEvent({ type: 'files_read', message: payload, raw: payload });
      } else if (payload.includes('Files Update successfully') || payload.includes('Files updated successfully')) {
        onEvent({ type: 'files_updated', message: payload, raw: payload });
      } else {
        // Generic message or generation text
        onEvent({ type: 'message', message: payload, raw: payload });
      }
    }
  }

  // Handle any remaining content in buffer
  if (buffer.trim()) {
    const payload = buffer.trim();
    if (payload.includes('Files Update successfully')) {
      onEvent({ type: 'files_updated', message: payload, raw: payload });
    } else {
      onEvent({ type: 'message', message: payload, raw: payload });
    }
  }
}

