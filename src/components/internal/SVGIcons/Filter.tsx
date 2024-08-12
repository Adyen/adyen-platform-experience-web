import { SVGProps } from 'preact/compat';

const Filter = ({ ...props }: Omit<SVGProps<SVGElement>, 'ref'>) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d="M1.25 1.25H14.75V4.05C14.75 4.65117 14.5094 5.22128 14.0903 5.64033L10.08 9.65066V11.6212L7.34093 14.76H5.92V9.65066L1.90967 5.64033C1.49062 5.22128 1.25 4.65117 1.25 4.05V1.25ZM2.75 2.75V4.05C2.75 4.24883 2.82938 4.43872 2.97033 4.57967L7.42 9.02934V12.388L8.58 11.0588V9.02934L13.0297 4.57967C13.1706 4.43872 13.25 4.24883 13.25 4.05V2.75H2.75Z"
            fill="#00112C"
        />
    </svg>
);

export default Filter;
