import { ErrorBoundary } from './components/ErrorBoundary';
import { DesignerPage } from './pages/DesignerPage';

function App() {
  return (
    <ErrorBoundary>
      <DesignerPage />
    </ErrorBoundary>
  );
}

export default App;
