export interface ImgProps {
    src?: string;
    backgroundUrl?: string;
    alt?: string;
    className?: string;

    /**
     * Class name modifiers will be used as: `adyen-pe-image--${modifier}`
     */
    classNameModifiers?: string[];

    /**
     * Show the image even if it fails to load
     * @defaultValue false
     */
    showOnError?: boolean;

    [key: string]: any;
}
