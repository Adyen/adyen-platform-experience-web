import { hasOwnProperty } from '@integration-components/utils';
import BaseCore from '../Core';
import type { CoreOptions } from './types';
import { applyTheme } from './theme/ThemeManager';

export class Core extends BaseCore {
    declare public options: CoreOptions;

    public constructor(options: CoreOptions) {
        super(options);
        applyTheme(options.themeMode, options.customTheme);
    }

    public override async update(options: Partial<CoreOptions> = {}): Promise<this> {
        const themeModeChanged = hasOwnProperty(options, 'themeMode');
        const customThemeChanged = hasOwnProperty(options, 'customTheme');
        const themeChanged =
            (themeModeChanged && options.themeMode !== this.options.themeMode) ||
            (customThemeChanged && options.customTheme !== this.options.customTheme);

        if (themeChanged) {
            applyTheme(
                themeModeChanged ? options.themeMode : this.options.themeMode,
                customThemeChanged ? options.customTheme : this.options.customTheme
            );
        }

        const hasNonThemeOptions = Object.keys(options).some(option => option !== 'themeMode' && option !== 'customTheme');
        if ((themeModeChanged || customThemeChanged) && !hasNonThemeOptions) {
            return this.setOptions(options);
        }

        return await super.update(options);
    }
}

export default Core;
