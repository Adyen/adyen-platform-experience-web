import cx from 'classnames';
import { useImageUrl } from '@src/hooks/useImageUrl/useImageUrl';
import { useMemo } from 'preact/hooks';

interface ImageProps {
    name: string;
    alt: string;
    extension?: string;
    className?: string;
    folder?: string;
}

export const Image = ({ folder = 'components/', className, alt, name, ...props }: ImageProps) => {
    const imageUrl = useImageUrl(
        useMemo(
            () => ({
                options: { imageFolder: folder, ...props },
                name,
            }),
            [folder, name, props]
        )
    );

    return <img className={cx('adyen-fp__image', className)} alt={alt} src={imageUrl} />;
};
