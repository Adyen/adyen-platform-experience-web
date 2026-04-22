import { defineConfig } from 'vite';
import { getEnvironment } from '../../../envs/getEnvs';

// Minimal Vite config for `vite preview` in `storybook:static`. The Storybook
// dev/build pipelines use the config inlined in `.storybook/main.ts`.
const { app } = getEnvironment('development');

export default defineConfig({
    preview: {
        host: app.host,
        port: app.port,
    },
});
