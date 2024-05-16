import { Ref } from 'preact';
import { SVGProps } from 'preact/compat';
import fixedForwardRef from '../../../utils/fixedForwardRef';

const ChevronLeft = fixedForwardRef(({ title, ...props }: Omit<SVGProps<SVGElement>, 'ref'>, ref: Ref<SVGSVGElement>) => (
    <svg {...props} ref={ref} width="7" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        {title && <title>{title}</title>}

        <path
            d="M5.56077 2.00011L2.56077 5.00011L5.56077 8.00011L4.50011 9.06077L0.439453 5.00011L4.50011 0.939453L5.56077 2.00011Z"
            fill={props.disabled ? '#8D95A3' : '#00112C'}
        />
    </svg>
));

export default ChevronLeft;
