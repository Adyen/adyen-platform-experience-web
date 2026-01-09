export interface AssetOptions {
    mainFolder?: string;
    extension?: string;
    name?: string;
    subFolder?: string;
    type?: string;
}

const getLocalAsset = ({ name, extension, subFolder, mainFolder }: AssetOptions) => {
    const path = `${mainFolder ? `${mainFolder}/` : ''}${subFolder ? `${subFolder}/` : ''}${name}${extension ? `.${extension}` : ''}`;
    return `src/assets/${path}`.replace(/\/+/, '/');
};

export class Assets {
    private readonly resourceContext: string;

    constructor(cdnContext: string) {
        this.resourceContext = cdnContext;
    }

    private returnAsset = ({ name, resourceUrl, mainFolder, extension, subFolder }: AssetOptions & { resourceUrl: string }): string =>
        `${resourceUrl}/${mainFolder ? `${mainFolder}/` : ''}${subFolder ? `${subFolder}/` : ''}${name}${extension ? `.${extension}` : ''}`;

    private getAssetUrl = (props: AssetOptions): string => {
        return process.env.VITE_LOCAL_ASSETS ? getLocalAsset({ ...props }) : this.returnAsset({ resourceUrl: this.resourceContext, ...props });
    };

    public getAsset(defaultProps: AssetOptions = {}) {
        return (props: AssetOptions) => this.getAssetUrl({ ...defaultProps, ...props });
    }
}
