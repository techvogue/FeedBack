import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from "react-redux";
import 'react-toastify/dist/ReactToastify.css';
import App from './App.jsx';
import ErrorBoundary from './components/layout/ErrorBoundary.jsx';
import './index.css';
import { store } from "./redux/store";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Provider>
  </StrictMode>,
)
