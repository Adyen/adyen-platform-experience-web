import { WITH_ERROR_CLASS } from './constants';
import { ErrorMessageDisplay } from '../ErrorMessageDisplay/ErrorMessageDisplay';
import { useConfigContext } from '../../../core/ConfigContext';
import { TranslationKey } from '../../../translations';
import cx from 'classnames';
import { PropsWithChildren } from 'preact/compat';
import { getErrorMessage } from '../../utils/getErrorMessage';
import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';

type DataOverviewContainerProps = PropsWithChildren<{
    balanceAccountsError?: Error;
    className: string;
    errorMessage: TranslationKey;
    isBalanceAccountIdWrong: boolean;
    onContactSupport?: () => void;
}>;

function DataOverviewContainer({
    balanceAccountsError,
    children,
    className,
    errorMessage,
    isBalanceAccountIdWrong,
    onContactSupport,
}: DataOverviewContainerProps) {
    const { hasError } = useConfigContext();

    // TODO: Verify if WITH_ERROR_CLASS should appended only for session setup error
    return (
        <div className={cx(className, { [WITH_ERROR_CLASS]: hasError })}>
            {hasError ? (
                <ErrorMessageDisplay
                    withImage
                    centered
                    title={'common.errors.somethingWentWrong'}
                    message={[errorMessage, 'common.errors.retry']}
                    refreshComponent={true}
                />
            ) : balanceAccountsError ? (
                <ErrorMessageDisplay
                    withImage
                    centered
                    {...getErrorMessage(balanceAccountsError as AdyenPlatformExperienceError, 'common.errors.accountUnavailable', onContactSupport)}
                />
            ) : isBalanceAccountIdWrong ? (
                <ErrorMessageDisplay
                    withImage
                    centered
                    title={'common.errors.somethingWentWrong'}
                    message={[errorMessage, 'common.errors.accountInvalid']}
                />
            ) : (
                <>{children}</>
            )}
        </div>
    );
}

export default DataOverviewContainer;
