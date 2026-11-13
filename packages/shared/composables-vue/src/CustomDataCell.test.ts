import { describe, expect, test, vi } from 'vitest';
import type { VNode } from 'vue';
import { CustomDataCell } from './CustomDataCell';
import styles from './CustomDataCell.module.scss';
import { CUSTOM_FIELD_ATTRIBUTE } from './useCustomColumnWidths';
import { useCustomDataCells } from './useCustomDataCells';

vi.mock('@adyen/bento-vue3', () => ({
    BentoButton: { name: 'BentoButton' },
    BentoLink: { name: 'BentoLink' },
}));

describe('CustomDataCell', () => {
    const renderValue = (value: unknown, field?: string) => {
        const component = CustomDataCell as unknown as {
            setup: (props: { value: unknown; field?: string }) => () => VNode;
        };
        return component.setup({ value, field })();
    };

    test('marks every rendered cell type with its custom field so its width can be measured', () => {
        const values = [
            'Plain',
            { type: 'text', value: 'Text' },
            { type: 'icon', value: 'Sydney', config: { src: 'flag.svg' } },
            { type: 'button', value: 'Refund', config: { action: vi.fn() } },
            { type: 'link', value: '8W54BM75W7DYCIVK', config: { href: 'https://example.com' } },
        ];

        for (const value of values) {
            expect(renderValue(value, 'reference').props).toMatchObject({ [CUSTOM_FIELD_ATTRIBUTE]: 'reference' });
        }
        expect(renderValue('Plain').props).not.toHaveProperty(CUSTOM_FIELD_ATTRIBUTE);
    });

    test('renders primitive and text values on one line', () => {
        expect(renderValue(null)).toMatchObject({ children: '', props: { class: styles.text } });

        const view = renderValue({ type: 'text', value: 'Label', config: { className: 'custom' } });
        expect(view.children).toBe('Label');
        expect(view.props?.class).toBe(`${styles.text} custom`);
    });

    test('renders an icon with accessible fallback text', () => {
        const view = renderValue({
            type: 'icon',
            value: 'Netherlands',
            config: { src: 'flag.svg', className: 'flag' },
        });
        const [image, label] = view.children as VNode[];

        expect(image!.props).toMatchObject({ src: 'flag.svg', alt: 'Netherlands' });
        expect(label!.props?.class).toBe(styles.iconLabel);
        expect(label!.children).toBe('Netherlands');
    });

    test.each([null, undefined, '', '   '])('does not render an icon label for an empty value (%s)', value => {
        const view = renderValue({ type: 'icon', value, config: { src: 'flag.svg', alt: 'Flag' } });
        const [image, label] = view.children as (VNode | null)[];

        expect(image!.props).toMatchObject({ src: 'flag.svg', alt: 'Flag' });
        expect(label).toBeNull();
    });

    test.each([0, false])('preserves non-empty falsy icon labels (%s)', value => {
        const view = renderValue({ type: 'icon', value, config: { src: 'flag.svg' } });
        const [, label] = view.children as VNode[];

        expect(label!.children).toBe(String(value));
    });

    test('stops row interaction before invoking a button action', () => {
        const action = vi.fn();
        const view = renderValue({
            type: 'button',
            value: 'Send',
            config: { action, className: 'custom' },
        });
        const stopPropagation = vi.fn();

        view.props?.onClick({ stopPropagation });

        expect(view.props?.class).toBe(`${styles.button} custom`);
        expect(stopPropagation).toHaveBeenCalledOnce();
        expect(action).toHaveBeenCalledOnce();
        expect((view.children as { default: () => string }).default()).toBe('Send');
    });

    test('renders external links on one line and gracefully falls back for unknown custom types', () => {
        const view = renderValue({
            type: 'link',
            value: 'Details',
            config: { href: 'https://example.com', className: 'custom' },
        });

        expect(view.props).toMatchObject({ to: 'https://example.com', external: true, class: `${styles.link} custom` });
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
