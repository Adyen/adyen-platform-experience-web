import { defineConfig, loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
    const envDir = path.resolve(__dirname, '../../envs');
    const env = loadEnv(mode, envDir, '');

    return {
        define: {
            __API_KEY__: JSON.stringify(env.API_KEY),
            __SESSION_ACCOUNT_HOLDER__: JSON.stringify(env.SESSION_ACCOUNT_HOLDER),
            __DEMO_PORT__: JSON.stringify(env.DEMO_PORT ?? '3031'),
        },
        server: {
            port: Number(env.DEMO_PORT ?? 3031),
            proxy: {
                '/api/sessions': {
                    target: 'https://test.adyen.com',
                    changeOrigin: true,
                    rewrite: path => path.replace(/^\/api\/sessions/, '/authe/api/v1/sessions'),
                },
            },
        },
    };
});
