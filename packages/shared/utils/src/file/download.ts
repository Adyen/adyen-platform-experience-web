import { EndpointDownloadStreamData } from '../../../types/src/api/endpoints';

export const downloadBlob = ({ blob, filename }: EndpointDownloadStreamData, defaultFilename = 'download') => {
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const clickHandler = () => {
        // In some browsers (such as Firefox and some versions of Chrome), synchronously revoking the object URL
        // immediately after calling a.click() can cancel the download or result in a network error because the
        // browser has not yet finished initiating the download request. Wrapping URL.revokeObjectURL(url) in a
        // short setTimeout ensures the browser has enough time to start the download before the URL is revoked.
        setTimeout(() => URL.revokeObjectURL(url), 150);
    };

    a.href = url;
    a.download = filename || defaultFilename;
    a.addEventListener('click', clickHandler, { once: true });

    a.click();
};
