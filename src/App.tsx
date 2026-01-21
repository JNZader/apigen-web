import { Analytics } from '@vercel/analytics/react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DesignerPage } from './pages/DesignerPage';

function App() {
  return (
    <>
      <ErrorBoundary>
        <DesignerPage />
      </ErrorBoundary>
      <Analytics />
    </>
  );
}

export default App;
