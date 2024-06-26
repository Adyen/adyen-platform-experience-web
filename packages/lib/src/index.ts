import { Core, CoreOptions } from './core';
import type { LangFile } from './core/Localization/types';
import './components/shared.scss';
import './style/index.scss';

export * from './core';
export * from './components';
export * from './types';

export async function AdyenPlatformExperience<AvailableTranslations extends LangFile[] = [], CustomTranslations extends {} = {}>(
    props: CoreOptions<AvailableTranslations, CustomTranslations>
) {
    const core = new Core(props);
    return await core.initialize();
}
