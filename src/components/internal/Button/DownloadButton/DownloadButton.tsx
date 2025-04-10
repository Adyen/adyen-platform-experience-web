import classNames from 'classnames';
import { VNode } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../core/Errors/AdyenPlatformExperienceError';
import { EndpointName } from '../../../../types/api/endpoints';
import { containerQueries, useResponsiveContainer } from '../../../../hooks/useResponsiveContainer';
import Spinner from '../../Spinner';
import Download from '../../SVGIcons/Download';
import Button from '../Button';
import { ButtonVariant } from '../types';
import useDownload from './useDownload';
import './DownloadButton.scss';

interface DownloadButtonProps {
    requestParams: any;
    iconButton?: boolean;
    endpointName: EndpointName;
    className?: string;
    disabled?: boolean;
    onDownloadRequested?: () => void;
    setError?: (error?: AdyenPlatformExperienceError) => any;
    errorDisplay?: VNode<any>;
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

function DownloadButton({
    className,
    disabled,
    endpointName,
    requestParams,
    setError,
    errorDisplay,
    onDownloadRequested,
    iconButton = false,
}: DownloadButtonProps) {
    const { i18n } = useCoreContext();
    const [fetchData, setFetchData] = useState(false);
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const { data, error, isFetching } = useDownload(endpointName, requestParams, fetchData);

    useEffect(() => {
        if (fetchData) {
            setFetchData(false);
        }
    }, [fetchData]);

    useEffect(() => {
        if (data) {
            // TODO: Fix the types to use type inference here
            downloadBlob(data as { blob: Blob; filename: string });
        }
    }, [data]);

    useEffect(() => {
        if (setError && error) {
            setError(error as AdyenPlatformExperienceError);
        }
    }, [error, setError]);

    const onClick = () => {
        setFetchData(true);
        onDownloadRequested?.();
    };

    const getButtonLabel = useCallback(() => (isFetching ? `${i18n.get('downloading')}..` : i18n.get('download')), [isFetching]);
    const getButtonIcon = useCallback(() => (isFetching ? <Spinner size={'small'} /> : <Download />), [isFetching]);

    return (
        <div
            className={classNames('adyen-pe-download', {
                'adyen-pe-download-button-container': !iconButton,
                'adyen-pe-download-icon-button-container': iconButton,
            })}
        >
            {isSmContainer ? (
                <Button iconButton={true} variant={ButtonVariant.TERTIARY} onClick={onClick}>
                    {isFetching ? <Spinner size={'small'} /> : <Download />}
                </Button>
            ) : (
                <Button
                    className={classNames(
                        'adyen-pe-download__button',
                        { 'adyen-pe-download__button--loading': isFetching, 'adyen-pe-download__button--icon': iconButton },
                        className
                    )}
                    disabled={disabled || isFetching}
                    variant={iconButton ? ButtonVariant.TERTIARY : ButtonVariant.SECONDARY}
                    onClick={onClick}
                    {...(!iconButton && { iconLeft: isFetching ? <Spinner size={'small'} /> : <Download /> })}
                >
                    {iconButton ? getButtonIcon() : getButtonLabel()}
                </Button>
            )}
            {error && errorDisplay && <div className={'adyen-pe-download__error'}>{errorDisplay}</div>}
        </div>
    );
}

export default DownloadButton;
