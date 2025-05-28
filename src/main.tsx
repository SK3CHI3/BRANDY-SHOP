import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/systemDiagnostics'
import './utils/testFixes'
import './utils/finalTest'

createRoot(document.getElementById("root")!).render(<App />);
