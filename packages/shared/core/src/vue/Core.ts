import { hasOwnProperty } from '@integration-components/utils';
import BaseCore from '../Core';
import type { CoreOptions } from './types';
import { applyTheme } from './theme/ThemeManager';

export class Core extends BaseCore {
    declare public options: CoreOptions;

    public constructor(options: CoreOptions) {
        super(options);
        applyTheme(options.theme);
    }

    public override async update(options: Partial<CoreOptions> = {}): Promise<this> {
        const themeChanged = hasOwnProperty(options, 'theme');

        if (themeChanged) {
            applyTheme(options.theme);
        }

        return await super.update(options);
    }
}

export default Core;
