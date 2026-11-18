import type { VNode } from 'vue';
import { expect, test, vi } from 'vitest';
import { BentoLoadingIndicator } from '@adyen/bento-vue3';
import { DataOverviewLoading } from './DataOverviewLoading';

vi.mock('@adyen/bento-vue3', () => ({
    BentoLoadingIndicator: { name: 'BentoLoadingIndicator' },
}));

test('renders an aria-busy loading area with the large spinner', () => {
    const component = DataOverviewLoading as unknown as { setup: () => () => VNode };
    const root = component.setup()();

    expect(root.props).toMatchObject({ 'aria-busy': 'true' });

    const children = root.children as VNode[];
    const spinner = children[0]!;

    expect(spinner.type).toBe(BentoLoadingIndicator);
    expect(spinner.props).toMatchObject({ large: true });
});
