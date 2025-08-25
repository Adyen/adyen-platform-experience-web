export interface ImageOptions {
    resourceUrl?: string;
    imageFolder?: string;
    extension?: string;
    name?: string;
    subFolder?: string;
    type?: string;
}

const getLocalAsset = ({ name, extension = 'svg', subFolder = 'images' }: ImageOptions) => {
    return `src/assets/${subFolder}/${name}.${extension}`;
};

export class Resources {
    private readonly resourceContext: string;

    constructor(cdnContext: string) {
        this.resourceContext = cdnContext;
    }

    private returnImage = ({ name, resourceUrl, imageFolder = '', extension, subFolder = '' }: ImageOptions): string =>
        `${resourceUrl}/${imageFolder}/${subFolder}/${name}.${extension}`;

    private getImageUrl = ({ resourceUrl, extension = 'svg', ...options }: ImageOptions): string => {
        const imageOptions: ImageOptions = {
            extension,
            resourceUrl,
            ...options,
        };

        return process.env.VITE_LOCAL_ASSETS ? getLocalAsset({ name: options.name, extension }) : this.returnImage(imageOptions);
    };

    public getImage(props: ImageOptions) {
        return this.getImageUrl({ ...props, resourceUrl: this.resourceContext });
    }
}
