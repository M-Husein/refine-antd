interface AppConfig {
  name: string,
  api: string,
  timeout: number,
  defaultLang: string,
  locales: {
    [key: string]: string
  },
}

/**
 * App Config
 * @var name        : "App name"
 * @var api         : "http://localhost:8000/api/v1"
 * @var timeout     : 30000
 * @var defaultLang : "id" | "en"
 * @var locales     : { id:"Indonesia", en:"English" }
 */
declare const APP: Readonly<AppConfig>;
declare global {
  const APP: Readonly<AppConfig>;
}

// * @var socials     : ["google", "linkedin"]

/**
 * @NOTE : For setup or app config in global window object
 */
declare global {
  interface Window {
    __APP__?: {
      page?: any;
      user?: any;
      [key: string]: any;
    };
    APP?: AppConfig;
  }
}

export {};

// // Laravel Starter kit
// import type { route as routeFn } from 'ziggy-js';

// declare global {
//     const route: typeof routeFn;
// }
