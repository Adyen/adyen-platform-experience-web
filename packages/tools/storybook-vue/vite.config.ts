import { defineConfig } from 'vite';
import { getEnvironment } from '../../../envs/getEnvs';

// Minimal Vite config for `vite preview`. Storybook dev/build pipelines use the
// config inlined in `.storybook/main.ts`.
const { app } = getEnvironment('development');

export default defineConfig({
    preview: {
        host: app.host,
        port: app.port,
    },
});
