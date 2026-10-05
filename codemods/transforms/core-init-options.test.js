import { test, expect } from 'vitest';
import { runTransform } from '../helpers.js';
import transform from './core-init-options.cjs';

test('removes availableTranslations from the init call', () => {
    const input = `
import { AdyenPlatformExperience, en_US, nl_NL } from '@adyen/adyen-platform-experience-web';

const core = await AdyenPlatformExperience({
    environment: 'test',
    locale: 'en-US',
    availableTranslations: [en_US, nl_NL],
    onSessionCreate: handleSessionCreate,
});
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(true);
    expect(output).not.toContain('availableTranslations');
    expect(output, 'keeps environment').toContain("environment: 'test'");
    expect(output, 'keeps locale').toContain("locale: 'en-US'");
    expect(output, 'keeps onSessionCreate').toContain('onSessionCreate: handleSessionCreate');
});

test('handles the UMD form of the init call', () => {
    const input = `
const core = await AdyenPlatformExperienceWeb.AdyenPlatformExperience({
    environment: 'test',
    availableTranslations: [],
    onSessionCreate: handleSessionCreate,
});
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(true);
    expect(output).not.toContain('availableTranslations');
    expect(output).toContain('onSessionCreate: handleSessionCreate');
});

test('init calls without availableTranslations are untouched', () => {
    const input = `
const core = await AdyenPlatformExperience({
    environment: 'test',
    themeMode: 'dark',
    customTheme: { light: { primary: '#0abf53' } },
    appearance: { illustrations: 'visible', titles: 'visible' },
    onSessionCreate: handleSessionCreate,
});
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(false);
    expect(output).toBe(input);
});

test('unrelated calls are ignored', () => {
    const input = `
const options = { availableTranslations: [en_US] };
initializeMyApp(options);
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(false);
    expect(output).toBe(input);
});
