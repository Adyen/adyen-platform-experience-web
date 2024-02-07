import useCoreContext from '@src/core/Context/useCoreContext';
import { EMPTY_OBJECT } from '@src/utils/common';

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

export const useImageUrl = ({ options = EMPTY_OBJECT, name }: { options: Partial<ImageOptions>; name: string }) => {
    const { loadingContext } = useCoreContext();

    // TODO - Get rid of FALLBACK_CDN_CONTEXT once we define our assets URL
    return returnImage({
        resourceContext: FALLBACK_CDN_CONTEXT || loadingContext,
        name,
        ...options,
    });
};
