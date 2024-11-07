import { Ref } from 'preact';
import { SVGProps } from 'preact/compat';
import { fixedForwardRef } from '../../../utils/preact';

/**
 * @deprecated This component is deprecated. Use <Icon name="square"/> instead.
 */
const UncheckedBox = fixedForwardRef(({ title, ...props }: Omit<SVGProps<SVGElement>, 'ref'>, ref: Ref<SVGSVGElement>) => (
    <svg {...props} ref={ref} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        {title && <title>{title}</title>}
        <path stroke="currentColor" d="M.5 4C.5 2 2.1.5 4 .5h8c2 0 3.5 1.6 3.5 3.5v8c0 2-1.6 3.5-3.5 3.5H4C2 15.5.5 13.9.5 12V4Z" />
    </svg>
));

export default UncheckedBox;
