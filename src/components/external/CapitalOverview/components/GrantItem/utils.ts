import { IGrant, IGrantStatus } from '../../../../../types';
import { TranslationKey } from '../../../../../translations';
import { TagVariant } from '../../../../internal/Tag/types';
import { GrantConfig } from './types';

const getHasDetails = (status: IGrantStatus) => status === 'Active';

const getIsBackgroundFilled = (status: IGrantStatus) => status === 'Repaid';

const getAmountLabelKey = (status: IGrantStatus): TranslationKey =>
    status === 'Active' ? 'capital.overview.grants.item.amounts.remaining' : 'capital.overview.grants.item.amounts.requestedFunds';

const getAmount = (grant: IGrant) => (grant.status === 'Active' ? grant.remainingTotalAmount : grant.grantAmount);

const getStatusKey = ({ status, missingActions }: IGrant): TranslationKey | undefined => {
    switch (status) {
        case 'Active':
            return undefined;
        case 'Failed':
            return 'capital.overview.grants.common.statuses.failed';
        case 'Pending':
            return missingActions && missingActions.length
                ? 'capital.overview.grants.common.statuses.actionNeeded'
                : 'capital.overview.grants.common.statuses.pending';
        case 'Repaid':
            return 'capital.overview.grants.common.statuses.fullyRepaid';
        case 'Revoked':
            return 'capital.overview.grants.common.statuses.revoked';
        case 'WrittenOff':
            return 'capital.overview.grants.common.statuses.writtenOff';
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
                    ? 'capital.overview.grants.common.statuses.pending.description.signTerms'
                    : undefined
                : 'capital.overview.grants.common.statuses.pending.description.awaitingFunds';
        case 'Failed':
            return 'capital.overview.grants.common.statuses.failed.description';
        case 'WrittenOff':
            return 'capital.overview.grants.common.statuses.writtenOff.description';
        case 'Revoked':
            return 'capital.overview.grants.common.statuses.revoked.description';
        default:
            return undefined;
    }
};

export const getGrantConfig = (grant: IGrant): GrantConfig => {
    const isGrantActive = grant.status === 'Active';
    const isGrantPending = grant.status === 'Pending';

    return {
        amount: getAmount(grant),
        amountLabelKey: getAmountLabelKey(grant.status),
        hasAlerts: isGrantPending,
        hasDetails: getHasDetails(grant.status),
        hasUnscheduledRepaymentDetails: isGrantActive && !!grant.unscheduledRepaymentAccounts?.length,
        // The grant revocation account details is currently not ready to be rendered.
        // A future iteration of this component might include revocation account details.
        // Only then should the following line be uncommented.
        //
        // hasRevocationDetails: isGrantActive && grant.revocationAccount !== undefined,
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
