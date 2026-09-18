import { describe, expect, test, vi } from 'vitest';
import type { VNode } from 'vue';
import { CustomDataCell } from './CustomDataCell';
import { useCustomDataCells } from './useCustomDataCells';

vi.mock('@adyen/bento-vue3', () => ({
    BentoButton: { name: 'BentoButton' },
    BentoLink: { name: 'BentoLink' },
}));

describe('CustomDataCell', () => {
    const renderValue = (value: unknown) => {
        const component = CustomDataCell as unknown as {
            setup: (props: { value: unknown }) => () => VNode;
        };
        return component.setup({ value })();
    };

    test('renders primitive and text values', () => {
        expect(renderValue(null).children).toBe('');

        const view = renderValue({ type: 'text', value: 'Label', config: { className: 'custom' } });
        expect(view.children).toBe('Label');
        expect(view.props?.class).toBe('custom');
    });

    test('renders an icon with accessible fallback text', () => {
        const view = renderValue({
            type: 'icon',
            value: 'Netherlands',
            config: { src: 'flag.svg', className: 'flag' },
        });
        const [image, label] = view.children as VNode[];

        expect(image!.props).toMatchObject({ src: 'flag.svg', alt: 'Netherlands' });
        expect(label!.children).toBe('Netherlands');
    });

    test('stops row interaction before invoking a button action', () => {
        const action = vi.fn();
        const view = renderValue({
            type: 'button',
            value: 'Send',
            config: { action },
        });
        const stopPropagation = vi.fn();

        view.props?.onClick({ stopPropagation });

        expect(stopPropagation).toHaveBeenCalledOnce();
        expect(action).toHaveBeenCalledOnce();
        expect((view.children as { default: () => string }).default()).toBe('Send');
    });

    test('renders external links and gracefully falls back for unknown custom types', () => {
        const view = renderValue({
            type: 'link',
            value: 'Details',
            config: { href: 'https://example.com' },
        });

        expect(view.props).toMatchObject({ to: 'https://example.com', external: true });
        expect((view.children as { default: () => string }).default()).toBe('Details');
        expect(renderValue({ type: 'unknown', value: 'Fallback' }).children).toBe('Fallback');
    });

    test('exposes custom-cell type guards', () => {
        const guards = useCustomDataCells();

        expect(guards.isCustomDataObject({ value: '' })).toBe(true);
        expect(guards.isCustomDataObject(null)).toBe(false);
        expect(guards.isIconType({ type: 'icon' })).toBe(true);
        expect(guards.isButtonType({ type: 'button' })).toBe(true);
        expect(guards.isLinkType({ type: 'link' })).toBe(true);
        expect(guards.isLinkType('link')).toBe(false);
    });
});
