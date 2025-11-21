import classNames from 'classnames';
import { VNode } from 'preact';
import { AriaAttributes } from 'preact/compat';
import { useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../core/Errors/AdyenPlatformExperienceError';
import { DownloadStreamEndpoint, EndpointDownloadStreamData } from '../../../../types/api/endpoints';
import { containerQueries, useResponsiveContainer } from '../../../../hooks/useResponsiveContainer';
import Spinner from '../../Spinner';
import Icon from '../../Icon';
import Button from '../Button';
import { ButtonVariant } from '../types';
import useDownload from './useDownload';
import './DownloadButton.scss';

interface DownloadButtonProps {
    requestParams: any;
    iconButton?: boolean;
    endpointName: DownloadStreamEndpoint;
    className?: string;
    disabled?: boolean;
    onDownloadRequested?: () => void;
    setError?: (error?: AdyenPlatformExperienceError) => any;
    errorDisplay?: VNode<any>;
    errorMessage?: (error: any) => VNode<any>;
}

function downloadBlob({ blob, filename }: EndpointDownloadStreamData) {
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
    errorMessage,
    ...ariaAttributeProps
}: DownloadButtonProps & Pick<AriaAttributes, 'aria-describedby' | 'aria-label' | 'aria-labelledby'>) {
    const { i18n } = useCoreContext();
    const [fetchData, setFetchData] = useState(false);
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const { data, error, isFetching } = useDownload(endpointName, requestParams, fetchData);

    useEffect(() => {
        if (fetchData) setFetchData(false);
    }, [fetchData]);

    useEffect(() => {
        if (data) downloadBlob(data);
    }, [data]);

    useEffect(() => {
        if (setError && error) setError(error as AdyenPlatformExperienceError);
    }, [error, setError]);

    const onClick = () => {
        setFetchData(true);
        onDownloadRequested?.();
    };

    const buttonIcon = useMemo(() => (isFetching ? <Spinner size={'small'} /> : <Icon name="download" />), [isFetching]);

    const buttonLabel = useMemo(() => {
        if (iconButton) {
            return buttonIcon;
        } else {
            return isFetching ? `${i18n.get('common.actions.download.labels.inProgress')}..` : i18n.get('common.actions.download.labels.default');
        }
    }, [buttonIcon, i18n, isFetching, iconButton]);

    return (
        <>
            <div
                className={classNames('adyen-pe-download', {
                    'adyen-pe-download-icon-button-container': iconButton,
                })}
            >
                {isSmContainer ? (
                    <Button iconButton={true} variant={ButtonVariant.TERTIARY} onClick={onClick} {...ariaAttributeProps}>
                        {buttonIcon}
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
                        {...(!iconButton && { iconLeft: buttonIcon })}
                        {...ariaAttributeProps}
                    >
                        {buttonLabel}
                    </Button>
                )}
                {error && errorDisplay && <div className={'adyen-pe-download__error'}>{errorDisplay}</div>}
            </div>
            {/* [TODO]: Remove errorMessage prop and rely on errorDisplay for rendering error  */}
            {error && errorMessage && errorMessage(error)}
        </>
    );
}

export default DownloadButton;
