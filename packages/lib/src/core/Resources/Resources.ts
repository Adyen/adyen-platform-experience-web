const FALLBACK_CDN_CONTEXT = 'https://cdf6519016.cdn.adyen.com/checkoutshopper/';

export interface ImageOptions {
    extension?: string;
    imageFolder?: string;
    resourceContext?: string;
    name?: string;
    parentFolder?: string;
    size?: string;
    subFolder?: string;
    svgOptions?: string;
    type?: string;
}

export type GetImageFnType = (name: string) => string;

const returnImage = ({ name, resourceContext, imageFolder = '', parentFolder = '', extension, size = '', subFolder = '' }: ImageOptions): string =>
    `${resourceContext}images/${imageFolder}${subFolder}${parentFolder}${name}${size}.${extension}`;

const getImageUrl = (resourceContext = FALLBACK_CDN_CONTEXT, defaultOptions: Partial<ImageOptions> = {}): GetImageFnType => {
    return (name: string): string => {
        const imageOptions: ImageOptions = {
            resourceContext,
            extension: 'svg',
            imageFolder: 'logos/',
            parentFolder: '',
            name,
            ...defaultOptions,
        };

        return returnImage(imageOptions);
    };
};

export const getImage = (resourceContext: string, props: ImageOptions | {} = {}) => {
    return getImageUrl(resourceContext, props);
};
