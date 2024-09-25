import { Ref } from 'preact';
import { SVGProps } from 'preact/compat';
import { fixedForwardRef } from '../../../utils/preact';

/**
 * @deprecated This component is deprecated. Use <Icon name="checkmark-square-fill"/> instead.
 */
const CheckedBox = fixedForwardRef(({ title, ...props }: Omit<SVGProps<SVGElement>, 'ref'>, ref: Ref<SVGSVGElement>) => (
    <svg {...props} ref={ref} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        {title && <title>{title}</title>}
        <path
            fill="currentColor"
            d="M1.25 3.5c0-1.24 1-2.25 2.25-2.25h9c1.24 0 2.25 1 2.25 2.25v9c0 1.24-1 2.25-2.25 2.25h-9c-1.24 0-2.25-1-2.25-2.25v-9ZM12.06 6 11 4.94l-4 4-2-2L3.94 8 7 11.06 12.06 6Z"
        />
    </svg>
));

export default CheckedBox;
