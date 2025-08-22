
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { AnalysisProvider } from './context/AnalysisContext';

createRoot(document.getElementById("root")!).render(
    <AuthProvider>
        <AnalysisProvider>
            <App />
        </AnalysisProvider>
    </AuthProvider>
);
