import { WITH_ERROR_CLASS } from './constants';
import { ErrorMessageDisplay } from '../ErrorMessageDisplay/ErrorMessageDisplay';
import useAuthContext from '../../../core/Auth/useAuthContext';
import { TranslationKey } from '../../../core/Localization/types';
import { PropsWithChildren } from 'preact/compat';
import cx from 'classnames';

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
