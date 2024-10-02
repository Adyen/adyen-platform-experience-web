import { SVGProps } from 'preact/compat';

/**
 * @deprecated This component is deprecated. Use <Icon name="download"/> instead.
 */
const Download = ({ ...props }: Omit<SVGProps<SVGElement>, 'ref'>) => (
    <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d="M8.25 0.25V8.18957L10.5001 5.93945L11.5608 7.00011L7.50011 11.0608L3.43945 7.00011L4.50011 5.93945L6.75 8.18934V0.25H8.25Z"
            fill="currentColor"
        />
        <path
            d="M2.25 11.5V9.25H0.75V11.5C0.75 12.0967 0.987053 12.669 1.40901 13.091C1.83097 13.5129 2.40326 13.75 3 13.75H12C12.5967 13.75 13.169 13.5129 13.591 13.091C14.0129 12.669 14.25 12.0967 14.25 11.5V9.25H12.75V11.5C12.75 11.6989 12.671 11.8897 12.5303 12.0303C12.3897 12.171 12.1989 12.25 12 12.25H3C2.80109 12.25 2.61032 12.171 2.46967 12.0303C2.32902 11.8897 2.25 11.6989 2.25 11.5Z"
            fill="currentColor"
        />
    </svg>
);

export default Download;
