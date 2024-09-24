import { Ref } from 'preact';
import { SVGProps } from 'preact/compat';
import { fixedForwardRef } from '../../../utils/preact';

/**
 * @deprecated This component is deprecated. Use <Icon name="checkmark"/> instead.
 */
const Checkmark = fixedForwardRef(({ title, ...props }: Omit<SVGProps<SVGElement>, 'ref'>, ref: Ref<SVGSVGElement>) => (
    <svg {...props} ref={ref} xmlns="http://www.w3.org/2000/svg" fill="none" width="16" viewBox="0 0 16 16" height="16">
        {title && <title>{title}</title>}
        <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M14.5 4.5a.7.7 0 0 0-1-1L6 10.9 2.5 7.5a.8.8 0 0 0-1 1l4 4a.8.8 0 0 0 1 0l8-8Z"
            clip-rule="evenodd"
        />
    </svg>
));

export default Checkmark;
