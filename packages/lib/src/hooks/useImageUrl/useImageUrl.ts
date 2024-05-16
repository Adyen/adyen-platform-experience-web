import useCoreContext from '../../core/Context/useCoreContext';
import { EMPTY_OBJECT } from '../../utils/common';
import { useMemo } from 'preact/hooks';

// TODO - Remove once we define a strategy to handle images
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
}: ImageOptions) => {
    const path = `/images/${imageFolder}/${subFolder}/${parentFolder}/${name}${size}.${extension}`.replace(/\/+/g, '/');
    return `${resourceContext}${path}`;
};

export const useImageUrl = ({ options = EMPTY_OBJECT, name }: { options: Partial<ImageOptions>; name: string }) => {
    const { loadingContext } = useCoreContext();

    // TODO - Get rid of FALLBACK_CDN_CONTEXT once we define our assets URL
    const image = useMemo(
        () =>
            returnImage({
                resourceContext: FALLBACK_CDN_CONTEXT || loadingContext,
                name,
                ...options,
            }),
        [loadingContext, name, options]
    );

    return image;
};
