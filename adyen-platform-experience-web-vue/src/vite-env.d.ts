/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_URL: string;
    readonly VITE_APP_PORT: string;
    readonly VITE_APP_LOADING_CONTEXT: string;
    readonly VITE_VERSION: string;
    readonly SESSION_ACCOUNT_HOLDER: string;
    readonly SESSION_API_URL: string;
    readonly USE_CDN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
    interface ProcessEnv {
        VITE_APP_URL?: string;
        VITE_APP_PORT?: string;
        VITE_APP_LOADING_CONTEXT?: string;
        VITE_VERSION?: string;
        VITE_LOCAL_ASSETS?: string;
        VITE_TEST_CDN_ASSETS?: string;
        VITE_MODE?: string;
        SESSION_ACCOUNT_HOLDER?: string;
        SESSION_AUTO_REFRESH?: string;
        SESSION_MAX_AGE_MS?: string;
        SESSION_PERMISSIONS?: string;
        SESSION_API_URL?: string;
        USE_CDN?: string;
        TEST_ENV?: string;
    }
}

declare var process: {
    env: NodeJS.ProcessEnv;
};
