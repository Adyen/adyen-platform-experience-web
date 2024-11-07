import { Ref } from 'preact';
import { SVGProps } from 'preact/compat';
import { fixedForwardRef } from '../../../utils/preact';

const CloseCircle = fixedForwardRef(({ title, ...props }: Omit<SVGProps<SVGElement>, 'ref'>, ref: Ref<SVGSVGElement>) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
        {title && <title>{title}</title>}
        <g clip-path="url(#a)">
            <path
                d="M.25 8a7.75 7.75 0 1 1 15.5 0A7.75 7.75 0 0 1 .25 8ZM6 4.94 4.94 6l2 2-2 2L6 11.06l2-2 2 2L11.06 10l-2-2 2-2L10 4.94l-2 2-2-2Z"
                fill="currentColor"
            />
        </g>
        <defs>
            <clipPath id="a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
));

export default CloseCircle;
