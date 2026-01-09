import { buildDevStandalone } from 'storybook/internal/core-server';

const STORYBOOK_DIR = __dirname;

buildDevStandalone({
    configDir: STORYBOOK_DIR,
    port: process.env.VITE_APP_PORT ? Number(process.env.VITE_APP_PORT) : 6006,
}).catch(console.error);
