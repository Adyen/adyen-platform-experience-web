import { Fragment } from 'preact';
import type { ComponentChild } from 'preact';
import { useCdnComponent } from './useCdnComponent';
import type { CdnComponentName, InferCdnComponentProps } from '../../types';

export type CdnComponentProps<Name extends CdnComponentName> = {
    readonly name: Name;
    readonly props?: InferCdnComponentProps<Name>;
    readonly loading?: ComponentChild;
    readonly error?: (error: Error) => ComponentChild;
};

export const CdnComponent = <Name extends CdnComponentName>({ name, props, loading: loadingSlot, error: errorSlot }: CdnComponentProps<Name>) => {
    const { component: Component, loading, error } = useCdnComponent(name);

    if (loading) {
        return <Fragment>{loadingSlot ?? null}</Fragment>;
    }

    if (error && errorSlot) {
        return <Fragment>{errorSlot(error)}</Fragment>;
    }

    if (!Component) {
        return null;
    }

    return <Component {...(props as any)} />;
};
