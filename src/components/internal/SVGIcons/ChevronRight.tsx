import { Ref } from 'preact';
import { SVGProps } from 'preact/compat';
import { fixedForwardRef } from '../../../utils/preact';

/**
 * @deprecated This component is deprecated. Use <Icon name="chevron-right"/> instead.
 */
const ChevronRight = fixedForwardRef(
    ({ title, ...props }: Omit<SVGProps<SVGSVGElement>, 'ref'> & Partial<SVGStyleElement>, ref: Ref<SVGSVGElement>) => (
        <svg {...props} ref={ref} width="7" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            {title && <title>{title}</title>}
            <path
                d="M0.439453 7.9999L3.43945 4.9999L0.439454 1.9999L1.50011 0.93924L5.56077 4.9999L1.50011 9.06056L0.439453 7.9999Z"
                fill={props.disabled ? '#8D95A3' : '#00112C'}
            />
        </svg>
    )
);

export default ChevronRight;
