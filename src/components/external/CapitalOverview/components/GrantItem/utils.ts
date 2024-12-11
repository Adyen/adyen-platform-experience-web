import { IGrant, IGrantStatus } from '../../../../../types';
import { TranslationKey } from '../../../../../translations';
import { TagVariant } from '../../../../internal/Tag/types';

const getHasDetails = (status: IGrantStatus) => status === 'Active';

const getIsBackgroundFilled = (status: IGrantStatus) => status === 'Repaid';

const getAmountLabelKey = (status: IGrantStatus): TranslationKey => (status === 'Active' ? 'capital.remaining' : 'capital.requestedFunds');

const getAmount = (grant: IGrant) => (grant.status === 'Active' ? grant.remainingTotalAmount : grant.grantAmount);

const getStatusKey = ({ status, missingActions }: IGrant): TranslationKey | undefined => {
    switch (status) {
        case 'Active':
            return undefined;
        case 'Failed':
            return 'capital.failed';
        case 'Pending':
            return missingActions && missingActions.length ? 'capital.actionNeeded' : 'capital.pending';
        case 'Repaid':
            return 'capital.fullyRepaid';
        case 'Revoked':
            return 'capital.revoked';
        case 'WrittenOff':
            return 'capital.writtenOff';
    }
};

const getStatusTagVariant = ({ status, missingActions }: IGrant): TagVariant => {
    switch (status) {
        case 'Failed':
            return TagVariant.ERROR;
        case 'Pending':
            return missingActions?.length ? TagVariant.WARNING : TagVariant.DEFAULT;
        case 'Repaid':
            return TagVariant.LIGHT;
        case 'Revoked':
        case 'WrittenOff':
            return TagVariant.WARNING;
        default:
            return TagVariant.DEFAULT;
    }
};

const getRepaymentPeriodEndDate = (repaymentPeriodLeft: number) => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + repaymentPeriodLeft);
    return endDate;
};

export const getStatusTooltipKey = (grant: IGrant): TranslationKey | undefined => {
    const pendingToS = grant.missingActions?.some(action => action.type === 'signToS') || false;

    switch (grant.status) {
        case 'Pending':
            return grant.missingActions?.length
                ? pendingToS
                    ? 'capital.signTheTermsToReceiveYourFunds'
                    : undefined
                : 'capital.youShouldGetTheFundsWithinOneBusinessDay';
        case 'Failed':
            return 'capital.weCouldNotProcessThisRequestTryAgain';
        case 'WrittenOff':
            return 'capital.youAcceptedTheseFundsButDidNotRepayThem';
        case 'Revoked':
            return 'capital.youAcceptedButThenReturnedTheseFunds';
        default:
            return undefined;
    }
};

export const getGrantConfig = (grant: IGrant) => {
    const isGrantActive = grant.status === 'Active';
    const isGrantPending = grant.status === 'Pending';

    return {
        amount: getAmount(grant),
        amountLabelKey: getAmountLabelKey(grant.status),
        hasAlerts: isGrantPending,
        hasDetails: getHasDetails(grant.status),
        isAmountColorSecondary: !isGrantActive,
        isBackgroundFilled: getIsBackgroundFilled(grant.status),
        isGrantIdVisible: !isGrantActive,
        isLabelColorSecondary: isGrantActive,
        isProgressBarVisible: isGrantActive,
        repaymentPeriodEndDate: getRepaymentPeriodEndDate(grant.repaymentPeriodLeft),
        statusKey: getStatusKey(grant),
        statusTagVariant: getStatusTagVariant(grant),
        statusTooltipKey: getStatusTooltipKey(grant),
    };
};
