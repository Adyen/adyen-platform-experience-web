import { Ref, VNode } from 'preact';
import { forwardRef } from 'preact/compat';

type _RenderResult = VNode | null;

/**
 * Alternative to using `forwardRef` but with fixed type inference.
 * @see [How To Use forwardRef With Generic Components]{@link https://www.totaltypescript.com/forwardref-with-generic-components}
 */
export const fixedForwardRef = <P, T>(render: (props: P, ref: Ref<T>) => _RenderResult): ((props: P & { ref?: Ref<T> }) => _RenderResult) =>
    forwardRef(render);

export default fixedForwardRef;
