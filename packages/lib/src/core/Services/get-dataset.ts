import { httpGet } from './http';

export default function getDataset<T = any>(name: string, loadingContext?: string, locale?: string) {
    const options = {
        loadingContext: loadingContext ?? '',
        errorLevel: 'warn' as const,
        errorMessage: `Dataset ${name} is not available`,
        path: locale ? `datasets/${name}/${locale}.json` : `datasets/${name}.json`,
    };

    return httpGet<T>(options);
}
