import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getEnvironment } from '../../envs/getEnvs.ts';
import { getBaseEnvDefines } from './base-env.ts';

vi.mock('../../envs/getEnvs.ts', () => ({ getEnvironment: vi.fn() }));

const LOADING_CONTEXT = 'http://localhost:8080/platform-components-external/api/';

describe('getBaseEnvDefines', () => {
    beforeEach(() => {
        vi.mocked(getEnvironment).mockReturnValue({
            api: { session: { url: 'http://localhost:8080/' } },
            app: { host: 'localhost', port: 3030, url: 'http://localhost:3030/', loadingContext: LOADING_CONTEXT },
        } as ReturnType<typeof getEnvironment>);
    });

    test.each(['development', 'local-env'])('should use the configured loading context in %s mode', mode => {
        expect(getBaseEnvDefines(mode)['process.env.VITE_APP_LOADING_CONTEXT']).toBe(JSON.stringify(LOADING_CONTEXT));
    });

    test('should not use the configured loading context in a production build', () => {
        expect(getBaseEnvDefines('production')['process.env.VITE_APP_LOADING_CONTEXT']).toBe('null');
    });
});
