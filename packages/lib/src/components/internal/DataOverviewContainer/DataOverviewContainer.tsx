import { WITH_ERROR_CLASS } from '@src/components/external/TransactionsOverview/components/TransactionsOverviewContainer/constants';
import { ErrorMessageDisplay } from '@src/components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import useAuthContext from '@src/core/Auth/useAuthContext';
import { TranslationKey } from '@src/core/Localization/types';
import cx from 'classnames';
import { PropsWithChildren } from 'preact/compat';

function DataOverviewContainer({
    wrongBalanceAccountId,
    className,
    errorMessage,
    children,
}: PropsWithChildren<{ wrongBalanceAccountId: boolean; className: string; errorMessage: TranslationKey }>) {
    const { sessionSetupError } = useAuthContext();

    return (
        <div className={cx(className, { [WITH_ERROR_CLASS]: sessionSetupError })}>
            {sessionSetupError ? (
                <ErrorMessageDisplay
                    withImage
                    centered
                    title={'somethingWentWrong'}
                    message={[errorMessage, 'tryRefreshingThePageOrComeBackLater']}
                    refreshComponent={true}
                />
            ) : wrongBalanceAccountId ? (
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
