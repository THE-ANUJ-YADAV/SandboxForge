import express from 'express'
import morgan from 'morgan'
import path from 'path'
import fs from 'fs'
import { Server } from 'socket.io'
import http from 'http'
import cors from 'cors';
import pty from 'node-pty'

const WORKING_DIR = '/workspace'

const app = express()
const httpServer = http.createServer(app)

app.use(morgan('dev'));
app.use(cors({
    methods: [ "GET", "POST", "PATCH", "DELETE" ],
    origin: "*",
}));

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH']
    }
})

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Hello from sandbox agent!',
        status: 'success'
    })
})

const shell = process.env.SHELL || '/bin/bash'

const ptyProcess = pty.spawn(shell, ['-i'], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: WORKING_DIR,
    env: {
        ...process.env,
        TERM: 'xterm-256color'
    }
})

console.log(`PTY started with shell: ${shell}`)

ptyProcess.onData((data) => {
    console.log('Terminal output:', data)
    io.emit('terminal-output', data)
})

ptyProcess.onExit(({ exitCode, signal }) => {
    console.log(
        `PTY process exited with code: ${exitCode}, signal: ${signal}`
    )
})

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.emit('terminal-ready', {
        status: 'connected'
    })

    socket.on('terminal-input', (data) => {
        try {
            const input = typeof data === 'string'
                ? data
                : data?.input

            if (typeof input !== 'string') {
                return
            }

            console.log('Terminal input:', JSON.stringify(input))

            ptyProcess.write(input)
        } catch (error) {
            console.error('Terminal input error:', error.message)
        }
    })

    socket.on('terminal-resize', ({ cols, rows }) => {
        if (
            Number.isInteger(cols) &&
            Number.isInteger(rows) &&
            cols > 0 &&
            rows > 0
        ) {
            ptyProcess.resize(cols, rows)
        }
    })

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
    })
})

app.get('/list-files', async (req, res) => {

    const listFiles = async (dir, baseDir) => {
        const entries = await fs.promises.readdir(dir, {
            withFileTypes: true
        })

        const files = []

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            const relativePath = path.relative(baseDir, fullPath)

            if (
                entry.isDirectory() &&
                ['node_modules', '.git', 'dist'].includes(entry.name)
            ) {
                continue
            }

            if (entry.isDirectory()) {
                files.push(...await listFiles(fullPath, baseDir))
            } else {
                files.push(relativePath)
            }
        }

        return files
    }

    try {
        const files = await listFiles(WORKING_DIR, WORKING_DIR)

        res.status(200).json({
            message: 'Files listed successfully',
            files
        })
    } catch (err) {
        res.status(500).json({
            message: `Error listing files: ${err.message}`,
            status: 'error'
        })
    }
})

app.get('/read-files', async (req, res) => {

    const files = req.query.files

    if (!files) {
        return res.status(400).json({
            message: 'No files specified in query parameter',
            status: 'error'
        })
    }

    const fileList = files.split(',')

    const results = await Promise.all(
        fileList.map(async (file) => {
            const filePath = path.join(WORKING_DIR, file)

            try {
                const content = await fs.promises.readFile(
                    filePath,
                    'utf-8'
                )

                return {
                    [filePath.replace(WORKING_DIR, '')]: content
                }
            } catch (err) {
                return {
                    [filePath.replace(WORKING_DIR, '')]:
                        `Error reading file: ${err.message}`
                }
            }
        })
    )

    res.status(200).json({
        message: 'File contents',
        files: results
    })
})

app.patch('/update-files', async (req, res) => {

    const updates = req.body.updates

    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            message: 'Invalid request body. Expected updates array.',
            status: 'error'
        })
    }

    const results = await Promise.all(
        updates.map(async (update) => {
            const { file, content } = update
            const filePath = path.join(WORKING_DIR, file)

            try {
                await fs.promises.mkdir(
                    path.dirname(filePath),
                    { recursive: true }
                )

                await fs.promises.writeFile(
                    filePath,
                    content,
                    'utf-8'
                )

                return {
                    [filePath]: 'File updated successfully'
                }
            } catch (err) {
                return {
                    [filePath]: `Error updating file: ${err.message}`
                }
            }
        })
    )

    res.status(200).json({
        message: 'File update results',
        results
    })
})

app.post('/create-files', async (req, res) => {

    const files = req.body.files

    if (!files || !Array.isArray(files)) {
        return res.status(400).json({
            message: 'Invalid request body. Expected files array.',
            status: 'error'
        })
    }

    const results = await Promise.all(
        files.map(async (fileObj) => {
            const { file, content } = fileObj
            const filePath = path.join(WORKING_DIR, file)

            try {
                await fs.promises.mkdir(
                    path.dirname(filePath),
                    { recursive: true }
                )

                await fs.promises.writeFile(
                    filePath,
                    content,
                    'utf-8'
                )

                return {
                    [filePath]: 'File created successfully'
                }
            } catch (err) {
                return {
                    [filePath]: `Error creating file: ${err.message}`
                }
            }
        })
    )

    res.status(200).json({
        message: 'File creation result',
        results
    })
})

export default httpServer