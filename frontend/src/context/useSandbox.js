import { useContext } from 'react';
import { SandboxContext } from './SandboxContextDefinition';

export function useSandbox() {
  const context = useContext(SandboxContext);
  if (!context) {
    throw new Error('useSandbox must be used within a SandboxProvider');
  }
  return context;
}
