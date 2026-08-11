import './index.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(
  document.getElementById('root')!, 
  {
    // onCaughtError: (error, errorInfo) => {
    //   if (error.message !== "Known error") {
    //     reportCaughtError({
    //       error,
    //       componentStack: errorInfo.componentStack,
    //     });
    //   }
    // },
    // onUncaughtError: (error, errorInfo) => {
    //   console.log({ error, errorInfo }); // type: "Uncaught", 
    // },
    // onRecoverableError: (error, errorInfo) => {
    //   console.log({ error, errorInfo }); // type: "Recoverable", 
    // },
    // identifierPrefix: "_", 
  }
).render(
  <StrictMode>
    <App />
  </StrictMode>
)
