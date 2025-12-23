import { EndpointDownloadStreamData } from '../../types/api/endpoints';

export const downloadBlob = ({ blob, filename }: EndpointDownloadStreamData) => {
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const clickHandler = () => void setTimeout(() => URL.revokeObjectURL(url), 150);

    a.href = url;
    a.download = filename || 'download';
    a.addEventListener('click', clickHandler, { once: true });

    a.click();
};
