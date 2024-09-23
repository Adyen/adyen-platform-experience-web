import { WITH_ERROR_CLASS } from './constants';
import { ErrorMessageDisplay } from '../ErrorMessageDisplay/ErrorMessageDisplay';
import { useAuthContext } from '../../../core/Auth';
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
    const { hasError } = useAuthContext();

    // TODO: Verify if WITH_ERROR_CLASS should appended only for session setup error
    return (
        <div className={cx(className, { [WITH_ERROR_CLASS]: hasError })}>
            {hasError ? (
                <ErrorMessageDisplay
                    withImage
                    centered
                    title={'somethingWentWrong'}
                    message={[errorMessage, 'tryRefreshingThePageOrComeBackLater']}
                    refreshComponent={true}
                />
            ) : balanceAccountsError ? (
                <ErrorMessageDisplay
                    withImage
                    centered
                    {...getErrorMessage(balanceAccountsError as AdyenPlatformExperienceError, 'weCouldNotLoadYourBalanceAccounts', onContactSupport)}
                />
            ) : isBalanceAccountIdWrong ? (
                <ErrorMessageDisplay
                    withImage
                    centered
                    title={'somethingWentWrong'}
                    message={[errorMessage, 'theSelectedBalanceAccountIsIncorrect']}
                />
            ) : (
                <>{children}</>
            )}
        </div>
    );
}

export default DataOverviewContainer;
