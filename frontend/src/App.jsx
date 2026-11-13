import { ThemeProvider } from './context/ThemeContext';
import { SandboxProvider } from './context/SandboxContext';
import { LayoutProvider } from './context/LayoutContext';
import Workspace from './components/Workspace';

export default function App() {
  return (
    <ThemeProvider>
      <SandboxProvider>
        <LayoutProvider>
          <Workspace />
        </LayoutProvider>
      </SandboxProvider>
    </ThemeProvider>
  );
}
