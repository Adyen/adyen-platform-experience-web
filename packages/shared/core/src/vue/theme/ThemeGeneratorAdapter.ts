import { ThemeGenerator } from '@adyen/adyen-shared-web';

export type ThemeStyleGenerator = Pick<ThemeGenerator, 'create' | 'destroy'>;

export const createThemeStyleGenerator = (): ThemeStyleGenerator => new ThemeGenerator();
