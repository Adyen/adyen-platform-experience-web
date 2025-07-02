import { Ref } from 'preact';
import { SVGProps } from 'preact/compat';
import { fixedForwardRef } from '../../../utils/preact';

/**
 * @deprecated This component is deprecated. Use <Icon name="chevron-up"/> instead.
 */
const ChevronUp = fixedForwardRef(({ title, ...props }: Omit<SVGProps<SVGSVGElement>, 'ref'>, ref: Ref<SVGSVGElement>) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
        {title && <title>{title}</title>}
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M13.53 11.03c-.3.3-.77.3-1.06 0L8 6.56l-4.47 4.47a.75.75 0 1 1-1.06-1.06l5-5c.3-.3.77-.3 1.06 0l5 5c.3.3.3.77 0 1.06Z"
            clipRule="evenodd"
        />
    </svg>
));

export default ChevronUp;
