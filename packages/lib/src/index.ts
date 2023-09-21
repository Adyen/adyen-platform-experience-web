import { CoreOptions } from './core/types';
import { Core } from './core';

export * from './core';
export * from './components';

export async function AdyenFP(props?: CoreOptions): Promise<Core> {
    const core = new Core(props ?? {});
    return await core.initialize();
}
