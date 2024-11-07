declare module '*.svg?component' {
    import type { ComponentProps, FunctionComponent } from 'preact';

    const SvgComponent: FunctionComponent<ComponentProps<'svg'>>;

    export default SvgComponent;
}
