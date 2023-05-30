import { Plugin, ProxyOptions } from 'vite';
import { Server } from 'node:http';
import { startServer } from '../../server/server';

const endpoints = ['/legalEntities', '/accountHolders', '/transactions', '/balanceAccounts'] as const satisfies Readonly<`/${string}`[]>;

export const mockApiProxies = (host: string, port: number) => {
    const mockServerProxyOptions: ProxyOptions = { target: `http://${host}:${port}` };
    const apiProxy = {} as Record<(typeof endpoints)[number], ProxyOptions>;
    endpoints.forEach(endpoint => (apiProxy[endpoint] = mockServerProxyOptions));
    return apiProxy;
};

export const mockServerPlugin = (httpPort: number, httpsPort = httpPort + 1): Plugin => {
    let mockHttpServer: Server | undefined;

    const startMockServer = async () => {
        const { httpServer } = startServer({ httpPort, httpsPort });
        mockHttpServer = httpServer;
    };

    return {
        name: 'mock-server-plugin',
        configureServer: startMockServer,
        configurePreviewServer: startMockServer,
        closeBundle() {
            mockHttpServer?.close();
            mockHttpServer = undefined;
        },
    };
};
