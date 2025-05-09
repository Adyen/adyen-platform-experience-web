import { SVGProps } from 'preact/compat';

/**
 * @deprecated This component is deprecated. Use <Icon name="copy"/> instead.
 */
const Copy = ({ ...props }: Omit<SVGProps<SVGSVGElement>, 'ref'>) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M3.5 1.25C2.25736 1.25 1.25 2.25736 1.25 3.5V8.5C1.25 9.74264 2.25736 10.75 3.5 10.75H5.25V12.5C5.25 13.7426 6.25736 14.75 7.5 14.75H12.5C13.7426 14.75 14.75 13.7426 14.75 12.5V7.5C14.75 6.25736 13.7426 5.25 12.5 5.25H10.75V3.5C10.75 2.25736 9.74264 1.25 8.5 1.25H3.5ZM9.25 5.25H7.5C6.25736 5.25 5.25 6.25736 5.25 7.5V9.25H3.5C3.08579 9.25 2.75 8.91421 2.75 8.5V3.5C2.75 3.08579 3.08579 2.75 3.5 2.75H8.5C8.91421 2.75 9.25 3.08579 9.25 3.5V5.25ZM6.75 12.5V7.5C6.75 7.08579 7.08579 6.75 7.5 6.75H12.5C12.9142 6.75 13.25 7.08579 13.25 7.5V12.5C13.25 12.9142 12.9142 13.25 12.5 13.25H7.5C7.08579 13.25 6.75 12.9142 6.75 12.5Z" />
    </svg>
);

export default Copy;
