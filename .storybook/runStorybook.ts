import { buildDevStandalone } from '@storybook/core-server';

const STORYBOOK_DIR = __dirname;

buildDevStandalone({
    configDir: STORYBOOK_DIR,
    port: process.env.VITE_PLAYGROUND_PORT ? Number(process.env.VITE_PLAYGROUND_PORT) : 6006,
}).catch(console.error);
