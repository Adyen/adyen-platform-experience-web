import cx from 'classnames';
import { useImageUrl } from '@src/hooks/useImageUrl/useImageUrl';

interface ImageProps {
    name: string;
    alt: string;
    extension?: string;
    className?: string;
    folder?: string;
}

export const Image = ({ folder = 'components/', className, alt, name, ...props }: ImageProps) => {
    const imageUrl = useImageUrl({
        options: { imageFolder: folder, ...props },
        name: name,
    });

    return <img className={cx('adyen-fp__image', className)} alt={alt} src={imageUrl} />;
};
