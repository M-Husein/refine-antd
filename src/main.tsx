// import "@refinedev/antd/dist/reset.css";
import "./styles/style.scss";

import { StrictMode } from 'react'; // React, 
import { createRoot } from 'react-dom/client';
import { App } from './App';

/** @NOTE : https://vitejs.dev/guide/env-and-mode.html#env-variables */
// console.log('MODE: ', import.meta.env.MODE);
// console.log('BASE_URL: ', import.meta.env.BASE_URL);
// console.log('PROD: ', import.meta.env.PROD);
// console.log('DEV: ', import.meta.env.DEV);
// console.log('SSR: ', import.meta.env.SSR);

console.log(
  `%c@ ${new Date().getFullYear()}, ${import.meta.env.VITE_APP_NAME}`, 
  'color:#777;text-shadow:1px 1px 0 #A0E7FE,2px 2px 1px rgba(0,0,0,.3);font-family:Arial;letter-spacing:2px;font-size:25px;font-weight:700'
);
// console.log('React version:', React.version);

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
);
