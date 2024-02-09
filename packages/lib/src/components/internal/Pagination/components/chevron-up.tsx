import { SVGProps } from 'preact/compat';

const ChevronUp = ({ role, title }: SVGProps<any>) => {
    return (
        <svg role={role || 'img'} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
            {title && <title>{title}</title>}
            <path
                fill="#00112C"
                fillRule="evenodd"
                d="M13.5303 11.0303C13.2374 11.3232 12.7626 11.3232 12.4697 11.0303L8 6.56066L3.53033 11.0303C3.23744 11.3232 2.76256 11.3232 2.46967 11.0303C2.17678 10.7374 2.17678 10.2626 2.46967 9.96967L7.46967 4.96967C7.76256 4.67678 8.23744 4.67678 8.53033 4.96967L13.5303 9.96967C13.8232 10.2626 13.8232 10.7374 13.5303 11.0303Z"
                clipRule="evenodd"
            />
        </svg>
    );
};

export default ChevronUp;
