import { Core, CoreOptions, TranslationSourceRecord } from './core';
import './components/shared.scss';
import './style/index.scss';

export * from './core';
export * from './components';
export * from './types';

export async function AdyenPlatformExperience<AvailableTranslations extends TranslationSourceRecord[] = [], CustomTranslations extends {} = {}>(
    props: CoreOptions<AvailableTranslations, CustomTranslations>
) {
    const core = new Core(props);
    return await core.initialize();
}
