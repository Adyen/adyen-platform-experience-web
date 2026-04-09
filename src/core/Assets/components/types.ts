import type { CdnComponentRegistry, CdnComponentName } from '../../../components/cdn/registry';

export type CdnComponentModule<Component> = {
    default: Component;
};

export type CdnComponentResult<Component> = {
    readonly component: Component | null;
    readonly loading: boolean;
    readonly error: Error | null;
};

export type RenderHandle<Props extends Record<string, unknown>> = {
    rerender(newProps: Props): void;
    destroy(): void;
};

export type RenderOptions<Name extends CdnComponentName> = {
    readonly component: Name;
    readonly props?: InferCdnComponentProps<Name>;
    readonly container: HTMLElement;
};

export type InferCdnComponentProps<Name extends CdnComponentName> = CdnComponentRegistry[Name];

// Re-export for convenience
export type { CdnComponentName };
