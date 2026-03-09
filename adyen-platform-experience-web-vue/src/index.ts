import { Core } from './core/Core';
import type { CoreOptions, CoreInstance } from './core/types';

export { Core } from './core/Core';
export * from './core/types';
export * from './components';

export async function AdyenPlatformExperienceVue(props: CoreOptions): Promise<CoreInstance> {
    const core = new Core(props);
    return await core.initialize();
}
