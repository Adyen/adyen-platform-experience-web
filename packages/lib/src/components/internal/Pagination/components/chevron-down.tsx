const ChevronDown = ({ title }: { title?: string }) => {
    return (
        <svg role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
            {title && <title>{title}</title>}
            <path
                fill="#00112C"
                fillRule="evenodd"
                d="M2.46967 4.96967C2.76256 4.67678 3.23744 4.67678 3.53033 4.96967L8 9.43934L12.4697 4.96967C12.7626 4.67678 13.2374 4.67678 13.5303 4.96967C13.8232 5.26257 13.8232 5.73744 13.5303 6.03033L8.53033 11.0303C8.23744 11.3232 7.76256 11.3232 7.46967 11.0303L2.46967 6.03033C2.17678 5.73744 2.17678 5.26256 2.46967 4.96967Z"
                clipRule="evenodd"
            />
        </svg>
    );
};

export default ChevronDown;
