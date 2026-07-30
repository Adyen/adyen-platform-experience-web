/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { VNode } from 'preact';
import type { ExternalComponentType } from '@integration-components/types';
import { UIElement } from './UIElement';
import CoreProvider from './CoreProvider';

class TestElement extends UIElement<{ balanceAccountId?: string }> {
    public static type: ExternalComponentType = 'transactions';

    constructor(core: any) {
        super({ core, balanceAccountId: 'BA_OLD' } as any);
        this.componentToRender = () => <div data-balance-account-id={this.props.balanceAccountId} />;
    }
}

const getComponentSubtree = (view: VNode) => {
    let subtree = view;

    for (let depth = 0; depth < 3; depth++) {
        subtree = subtree.props.children as VNode;
    }

    return subtree;
};

describe('UIElement', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('provides a refresh callback scoped to the current element', () => {
        const core = {
            analyticsEnabled: true,
            getCdnConfig: vi.fn(),
            getCdnDataset: vi.fn(),
            getDatasetAsset: vi.fn(),
            getImageAsset: vi.fn(),
            loadingContext: '',
            localization: { i18n: {} },
            options: { environment: 'test' },
            registerComponent: vi.fn(),
            session: {},
            update: vi.fn(),
        };
        const element = new TestElement(core);
        const sibling = new TestElement(core);
        const updateElement = vi.spyOn(element, 'update');
        const updateSibling = vi.spyOn(sibling, 'update');
        const provider = (element.render() as any).props.children as { type: unknown; props: { refreshComponent: () => void } };

        expect(provider.type).toBe(CoreProvider);

        provider.props.refreshComponent();

        expect(updateElement).toHaveBeenCalledOnce();
        expect(updateElement).toHaveBeenCalledWith(element.props);
        expect(updateSibling).not.toHaveBeenCalled();
        expect(core.update).not.toHaveBeenCalled();
    });

    test('remounts the component subtree without remounting its providers', () => {
        const core = {
            analyticsEnabled: true,
            getCdnConfig: vi.fn(),
            getCdnDataset: vi.fn(),
            getDatasetAsset: vi.fn(),
            getImageAsset: vi.fn(),
            loadingContext: '',
            localization: { i18n: {} },
            options: { environment: 'test' },
            registerComponent: vi.fn(),
            session: {},
        };
        const element = new TestElement(core);
        const initialView = element.render() as VNode;
        const initialProviderKey = initialView.key;
        const initialComponentKey = getComponentSubtree(initialView).key;

        element.update({ balanceAccountId: 'BA_NEW' } as any);
        const updatedView = element._component as VNode;
        const updatedComponentKey = getComponentSubtree(updatedView).key;

        expect(updatedView.key).toBe(initialProviderKey);
        expect(updatedComponentKey).toBe(initialComponentKey);
        expect(element.props.balanceAccountId).toBe('BA_NEW');

        const provider = (updatedView as any).props.children as { props: { refreshComponent: () => void } };
        provider.props.refreshComponent();
        const refreshedView = element._component as VNode;
        const refreshedComponentKey = getComponentSubtree(refreshedView).key;

        expect(refreshedView.key).toBe(initialProviderKey);
        expect(refreshedComponentKey).not.toBe(updatedComponentKey);
    });
});
