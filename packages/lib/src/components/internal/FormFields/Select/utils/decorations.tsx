import { Ref } from 'preact';
import { SVGProps } from 'preact/compat';
import fixedForwardRef from '@src/utils/fixedForwardRef';

export const Checkmark = fixedForwardRef(({ title, ...props }: Omit<SVGProps<SVGElement>, 'ref'>, ref: Ref<SVGSVGElement>) => (
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

export const CheckedBox = fixedForwardRef(({ title, ...props }: Omit<SVGProps<SVGElement>, 'ref'>, ref: Ref<SVGSVGElement>) => (
    <svg {...props} ref={ref} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        {title && <title>{title}</title>}
        <path
            fill="currentColor"
            d="M1.25 3.5c0-1.24 1-2.25 2.25-2.25h9c1.24 0 2.25 1 2.25 2.25v9c0 1.24-1 2.25-2.25 2.25h-9c-1.24 0-2.25-1-2.25-2.25v-9ZM12.06 6 11 4.94l-4 4-2-2L3.94 8 7 11.06 12.06 6Z"
        />
    </svg>
));

export const UncheckedBox = fixedForwardRef(({ title, ...props }: Omit<SVGProps<SVGElement>, 'ref'>, ref: Ref<SVGSVGElement>) => (
    <svg {...props} ref={ref} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        {title && <title>{title}</title>}
        <path stroke="currentColor" d="M.5 4C.5 2 2.1.5 4 .5h8c2 0 3.5 1.6 3.5 3.5v8c0 2-1.6 3.5-3.5 3.5H4C2 15.5.5 13.9.5 12V4Z" />
    </svg>
));

export const ChevronDown = fixedForwardRef(({ title, ...props }: Omit<SVGProps<SVGElement>, 'ref'>, ref: Ref<SVGSVGElement>) => (
    <svg {...props} ref={ref} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        {title && <title>{title}</title>}
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M2.47 4.97c.3-.3.77-.3 1.06 0L8 9.44l4.47-4.47a.75.75 0 1 1 1.06 1.06l-5 5c-.3.3-.77.3-1.06 0l-5-5a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
        />
    </svg>
));

export const ChevronUp = fixedForwardRef(({ title, ...props }: Omit<SVGProps<SVGElement>, 'ref'>, ref: Ref<SVGSVGElement>) => (
    <svg {...props} ref={ref} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        {title && <title>{title}</title>}
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M13.53 11.03c-.3.3-.77.3-1.06 0L8 6.56l-4.47 4.47a.75.75 0 1 1-1.06-1.06l5-5c.3-.3.77-.3 1.06 0l5 5c.3.3.3.77 0 1.06Z"
            clipRule="evenodd"
        />
    </svg>
));
