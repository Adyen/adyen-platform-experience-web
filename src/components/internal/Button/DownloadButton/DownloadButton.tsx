import { useEffect, useState } from 'preact/hooks';
import { EndpointName } from '../../../../types/api/endpoints';
import Spinner from '../../Spinner';
import Download from '../../SVGIcons/Download';
import Button from '../Button';
import { ButtonVariant } from '../types';
import useDownload from './useDownload';

interface DownloadButtonProps {
    params: any;
    endpointName: EndpointName;
    className?: string;
}

function downloadBlob({ blob, filename }: { blob: Blob; filename: string }) {
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);

    a.href = url;
    a.download = filename || 'download';

    const clickHandler = () => {
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 150);
    };

    a.addEventListener('click', clickHandler, { once: true });
    a.click();
}

function DownloadButton({ endpointName, params, ...props }: DownloadButtonProps) {
    const [fetchData, setFetchData] = useState(false);
    const { data, isFetching } = useDownload(endpointName, params, fetchData);

    useEffect(() => {
        if (fetchData) {
            setFetchData(false);
        }
    }, [fetchData]);

    useEffect(() => {
        if (data) {
            downloadBlob(data);
        }
    }, [data]);

    const onClick = () => setFetchData(true);

    if (isFetching) {
        return <Spinner size={'small'} />;
    }

    return (
        <Button iconButton={true} variant={ButtonVariant.TERTIARY} onClick={onClick} {...props}>
            <Download />
        </Button>
    );
}

export default DownloadButton;
