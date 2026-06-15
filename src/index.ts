import { Core, CoreOptions, TranslationSourceRecord } from '@integration-components/core';
import '@integration-components/style';
import './global';

export * from '@integration-components/core';

export async function AdyenPlatformExperience<
    AvailableTranslations extends TranslationSourceRecord[] = [],
    CustomTranslations extends object = Record<never, never>,
>(props: CoreOptions<AvailableTranslations, CustomTranslations>) {
    const core = new Core(props);
    return await core.initialize();
}
