import { Core, CoreOptions } from '@integration-components/core';
import '@integration-components/style';
import './global';

export * from '@integration-components/core';

export async function AdyenPlatformExperience<CustomTranslations extends object = Record<never, never>>(props: CoreOptions<CustomTranslations>) {
    const core = new Core(props);
    return await core.initialize();
}
