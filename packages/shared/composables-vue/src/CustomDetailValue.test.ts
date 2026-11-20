// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, type App } from 'vue';
import CustomDetailValue from './CustomDetailValue.vue';
import styles from './CustomDetailValue.module.scss';

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');
    const passthrough = (tag: string) =>
        defineComponent({
            setup:
                (_props, { slots, attrs }) =>
                () =>
                    h(tag, attrs, slots.default?.()),
        });
    return {
        BentoLink: passthrough('a'),
        BentoTypography: passthrough('p'),
    };
});

const FLAG_SRC = 'flag.svg';

describe('CustomDetailValue', () => {
    let app: App | undefined;
    let target: HTMLDivElement;

    beforeEach(() => {
        target = document.createElement('div');
        document.body.appendChild(target);
    });

    afterEach(() => {
        app?.unmount();
        target.remove();
    });

    const mount = (value: unknown) => {
        app = createApp(() => h(CustomDetailValue, { value }));
        app.mount(target);
        return target.firstElementChild as HTMLElement;
    };

    describe('Icons', () => {
        test('should render the icon and its label side by side in the same row container', () => {
            const view = mount({ type: 'icon', value: 'Spain', config: { src: FLAG_SRC, className: 'custom' } });
            const [image, label] = [...view.children];

            expect(view.className).toBe(`${styles.icon} custom`);
            expect(image?.tagName).toBe('IMG');
            expect(image?.getAttribute('src')).toBe(FLAG_SRC);
            expect(image?.getAttribute('alt')).toBe('Spain');
            expect(image?.className).toBe(styles.iconImage);
            expect(label?.textContent?.trim()).toBe('Spain');
        });

        test.each([null, undefined, '', '   '])('should not render an empty label line next to the icon (%s)', value => {
            const view = mount({ type: 'icon', value, config: { src: FLAG_SRC } });

            expect(view.children).toHaveLength(1);
            expect(view.firstElementChild?.tagName).toBe('IMG');
            expect(view.firstElementChild?.getAttribute('alt')).toBe(String(value ?? ''));
        });

        test.each([0, false])('should keep non-empty falsy labels (%s)', value => {
            const view = mount({ type: 'icon', value, config: { src: FLAG_SRC } });

            expect(view.children).toHaveLength(2);
            expect(view.lastElementChild?.textContent?.trim()).toBe(String(value));
        });

        test('should prefer the configured alt text', () => {
            const view = mount({ type: 'icon', value: 'Spain', config: { src: FLAG_SRC, alt: 'Flag of Spain' } });

            expect(view.firstElementChild?.getAttribute('alt')).toBe('Flag of Spain');
        });

        test('should fall back to text when no icon source is configured', () => {
            const view = mount({ type: 'icon', value: 'Spain', config: {} });

            expect(view.tagName).toBe('P');
            expect(view.textContent?.trim()).toBe('Spain');
        });
    });

    describe('Links', () => {
        test('should render an external link that opens in a new tab by default', () => {
            const view = mount({ type: 'link', value: 'See summary', config: { href: 'https://example.com', className: 'custom' } });

            expect(view.tagName).toBe('A');
            expect(view.textContent?.trim()).toBe('See summary');
            expect(view.getAttribute('to')).toBe('https://example.com');
            expect(view.getAttribute('target')).toBe('_blank');
            expect(view.getAttribute('rel')).toBe('noopener noreferrer');
            expect(view.className).toBe('custom');
        });

        test('should fall back to text when no link target is configured', () => {
            const view = mount({ type: 'link', value: 'See summary', config: {} });

            expect(view.tagName).toBe('P');
            expect(view.textContent?.trim()).toBe('See summary');
        });
    });

    describe('Text', () => {
        test.each([
            ['primitive values', 'Coffee', 'Coffee'],
            ['numbers', 42, '42'],
            ['text objects', { type: 'text', value: 'Coffee' }, 'Coffee'],
        ])('should render %s as text', (_, value, expected) => {
            const view = mount(value);

            expect(view.tagName).toBe('P');
            expect(view.textContent?.trim()).toBe(expected);
        });

        test('should apply the configured class name to text values', () => {
            const view = mount({ type: 'text', value: 'Coffee', config: { className: 'custom' } });

            expect(view.className).toBe('custom');
        });
    });
});
