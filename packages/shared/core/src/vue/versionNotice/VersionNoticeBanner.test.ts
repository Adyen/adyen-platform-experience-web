/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createApp, type App } from 'vue';
import { useCoreContext } from '../Context';
import type { VersionNotice } from '../../versionNotice/types';
import VersionNoticeBanner from './VersionNoticeBanner.vue';

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        BentoAlert: defineComponent({
            name: 'BentoAlert',
            props: { type: { type: String, default: 'highlight' }, closeButton: { type: Boolean, default: false } },
            emits: ['close-alert'],
            setup:
                (props, { emit, slots }) =>
                () =>
                    h('div', { 'data-alert-type': props.type }, [
                        h('strong', slots.default?.()),
                        h('p', slots.description?.()),
                        props.closeButton ? h('button', { 'aria-label': 'Close', onClick: () => emit('close-alert') }) : null,
                    ]),
        }),
    };
});

vi.mock('../Context', () => ({ useCoreContext: vi.fn() }));

const i18n = {
    get: vi.fn((key: string, options?: { values?: Record<string, string> }) => (options?.values ? `${key} ${JSON.stringify(options.values)}` : key)),
};

vi.mocked(useCoreContext).mockReturnValue({ i18n, translationDomain: 'payouts' } as unknown as ReturnType<typeof useCoreContext>);

describe('VersionNoticeBanner', () => {
    let mounted: { app: App; target: HTMLElement }[] = [];

    afterEach(() => {
        mounted.forEach(({ app, target }) => {
            app.unmount();
            target.remove();
        });
        mounted = [];
    });

    const mountBanner = (notice: VersionNotice, onDismiss = vi.fn()) => {
        const target = document.createElement('div');
        const app = createApp(VersionNoticeBanner, { notice, onDismiss });
        app.mount(target);
        mounted.push({ app, target });
        return target;
    };

    describe('Rendering', () => {
        test('should warn about a deprecated version', () => {
            const target = mountBanner({ kind: 'deprecated', currentVersion: '1.12.0' });

            expect(target.querySelector('[data-alert-type]')?.getAttribute('data-alert-type')).toBe('warning');
            expect(target.querySelector('strong')?.textContent).toBe('payouts.common.versionNotice.deprecated.title');
            expect(target.querySelector('p')?.textContent).toBe('payouts.common.versionNotice.deprecated.description {"currentVersion":"1.12.0"}');
        });

        test('should highlight a newer prerelease with both versions', () => {
            const target = mountBanner({ kind: 'outdated', currentVersion: '2.0.0-beta.1', latestVersion: '2.0.0-beta.3' });

            expect(target.querySelector('[data-alert-type]')?.getAttribute('data-alert-type')).toBe('highlight');
            expect(target.querySelector('strong')?.textContent).toBe('payouts.common.versionNotice.outdated.title');
            expect(target.querySelector('p')?.textContent).toBe(
                'payouts.common.versionNotice.outdated.description {"currentVersion":"2.0.0-beta.1","latestVersion":"2.0.0-beta.3"}'
            );
        });

        test('should announce the notice politely to assistive technologies', () => {
            const target = mountBanner({ kind: 'deprecated', currentVersion: '1.12.0' });

            expect(target.querySelector('[role="status"]')).toBeTruthy();
        });
    });

    describe('Interactions', () => {
        test('should request dismissal when the alert is closed', () => {
            const onDismiss = vi.fn();
            const target = mountBanner({ kind: 'deprecated', currentVersion: '1.12.0' }, onDismiss);

            target.querySelector<HTMLButtonElement>('button[aria-label="Close"]')?.click();

            expect(onDismiss).toHaveBeenCalledOnce();
        });
    });
});
