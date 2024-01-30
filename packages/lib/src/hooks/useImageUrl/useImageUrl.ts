import useCoreContext from '@src/core/Context/useCoreContext';

const FALLBACK_CDN_CONTEXT = 'https://cdf6519016.cdn.adyen.com/checkoutshopper/';

export interface ImageOptions {
    extension?: string;
    imageFolder?: string;
    resourceContext?: string;
    name: string;
    parentFolder?: string;
    size?: string;
    subFolder?: string;
}

const returnImage = ({
    name,
    resourceContext,
    imageFolder = 'logos/',
    parentFolder = '',
    extension = 'svg',
    size = '',
    subFolder = '',
}: ImageOptions) => `${resourceContext}images/${imageFolder}${subFolder}${parentFolder}${name}${size}.${extension}` as const;

export const useImageUrl = ({ options = {}, name }: { resourceContext: string; options: Partial<ImageOptions>; name: string }) => {
    const { cdnContext } = useCoreContext();

    return returnImage({
        resourceContext: cdnContext || FALLBACK_CDN_CONTEXT,
        name,
        ...options,
    });
};
