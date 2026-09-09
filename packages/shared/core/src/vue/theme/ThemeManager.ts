import type { CustomThemes, ThemeMode, ThemeVariables } from '../types';
import { ThemeGenerator } from '@adyen/adyen-shared-web';

export const THEME_MODE_ATTRIBUTE = 'data-adyen-pe-theme';

type ThemeStyleGenerator = Pick<ThemeGenerator, 'create' | 'destroy'>;

const hasVariables = (variables: ThemeVariables | undefined): variables is ThemeVariables => !!variables && Object.keys(variables).length > 0;

export class ThemeManager {
    public constructor(private readonly generator: ThemeStyleGenerator = new ThemeGenerator()) {}

    public apply(mode: ThemeMode = 'light', customThemes?: CustomThemes): void {
        const variables = customThemes?.[mode];

        if (hasVariables(variables)) {
            this.generator.create({
                ...variables,
                dark: mode === 'dark',
            });
        } else {
            this.generator.destroy();
        }

        if (mode === 'dark') {
            document.documentElement.setAttribute(THEME_MODE_ATTRIBUTE, 'dark');
        } else {
            document.documentElement.removeAttribute(THEME_MODE_ATTRIBUTE);
        }
    }
}

let themeManager: ThemeManager | undefined;

export const applyTheme = (mode: ThemeMode | undefined, customThemes?: CustomThemes): void => {
    if (typeof document === 'undefined') return;

    (themeManager ??= new ThemeManager()).apply(mode, customThemes);
};
