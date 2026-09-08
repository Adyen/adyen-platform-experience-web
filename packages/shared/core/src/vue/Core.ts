import { hasOwnProperty } from '@integration-components/utils';
import BaseCore from '../Core';
import type { CoreOptions } from './types';
import { applyTheme } from './theme/ThemeManager';

export class Core extends BaseCore {
    declare public options: CoreOptions;

    public constructor(options: CoreOptions) {
        super(options);
        applyTheme(options.themeMode, options.customThemes);
    }

    public override async update(options: Partial<CoreOptions> = {}): Promise<this> {
        const themeModeChanged = hasOwnProperty(options, 'themeMode');
        const customThemesChanged = hasOwnProperty(options, 'customThemes');

        if (themeModeChanged || customThemesChanged) {
            applyTheme(
                themeModeChanged ? options.themeMode : this.options.themeMode,
                customThemesChanged ? options.customThemes : this.options.customThemes
            );
        }

        return await super.update(options);
    }
}

export default Core;
