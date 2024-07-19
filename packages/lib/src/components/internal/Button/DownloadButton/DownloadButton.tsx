import { useEffect, useState } from 'preact/hooks';
import { EndpointName } from '../../../../types/api/endpoints';
import Spinner from '../../Spinner';
import Download from '../../SVGIcons/Download';
import Button from '../Button';
import { ButtonVariant } from '../types';
import useDownload from './useDownload';

interface DownloadButtonProps {
    fileName: string;
    params: any;
    endpointName: EndpointName;
}

function downloadBlob(blob: any, filename: any) {
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = filename || 'download';

    console.log('filename ', filename);

    const clickHandler = () => {
        setTimeout(() => {
            URL.revokeObjectURL(url);
            removeEventListener('click', clickHandler);
        }, 150);
    };

    a.addEventListener('click', clickHandler, false);
    a.click();

    return a;
}

function DownloadButton<T extends Function>({ fileName, endpointName, params, ...props }: DownloadButtonProps) {
    const [fetchData, setFetchData] = useState(false);
    const { data, isFetching } = useDownload(endpointName, params, fetchData);

    useEffect(() => {
        if (fetchData) {
            setFetchData(false);
        }
    }, [fetchData]);

    useEffect(() => {
        if (data) {
            downloadBlob(data, fileName);
        }
    }, [data]);

    const onClick = () => setFetchData(true);

    if (isFetching) {
        return <Spinner size={'small'} />;
    }

    return (
        <Button variant={ButtonVariant.TERTIARY} onClick={onClick} {...props}>
            <Download />
        </Button>
    );
}

export default DownloadButton;
