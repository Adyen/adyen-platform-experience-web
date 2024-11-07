import cx from 'classnames';
import { useImageUrl } from '../../../hooks/useImageUrl';
import { useMemo } from 'preact/hooks';

interface ImageProps {
    name: string;
    alt: string;
    extension?: string;
    className?: string;
    folder?: string;
}

export const Image = ({ folder = 'components/', className, alt, name, extension }: ImageProps) => {
    const imageUrl = useImageUrl({
        options: useMemo(() => ({ imageFolder: folder, extension }), [extension, folder]),
        name,
    });

    return <img className={cx('adyen-pe__image', className)} alt={alt} src={imageUrl} />;
};
