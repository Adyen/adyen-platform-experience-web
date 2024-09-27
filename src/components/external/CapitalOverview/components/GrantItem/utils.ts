import { IGrant, IGrantStatus } from '../../../../../types';
import { TranslationKey } from '../../../../../translations';
import { TagVariant } from '../../../../internal/Tag/types';

const getIsBackgroundFilled = (status: IGrantStatus) => status === 'Repaid';

const getLabelKey = ({ status, repayedAmount }: IGrant): TranslationKey => {
    if (status === 'Active') {
        return repayedAmount.value ? 'capital.repaid' : 'capital.initialFunds';
    } else if (status === 'Repaid') {
        return 'capital.initialFunds';
    }
    return 'capital.requestedFunds';
};

const getAmount = (grant: IGrant) => (grant.status === 'Active' && grant.repayedGrantAmount.value ? grant.repayedGrantAmount : grant.grantAmount);

const getStatusKey = (status: IGrantStatus): TranslationKey | undefined => {
    switch (status) {
        case 'Active':
            return undefined;
        case 'Failed':
            return 'capital.failed';
        case 'Pending':
            return 'capital.pending';
        case 'Repaid':
            return 'capital.fullyRepaid';
        case 'Revoked':
            return 'capital.revoked';
        case 'WrittenOff':
            return 'capital.writtenOff';
    }
};

const getStatusTagVariant = (status: IGrantStatus): TagVariant => {
    switch (status) {
        case 'Failed':
            return TagVariant.ERROR;
        case 'Repaid':
            return TagVariant.LIGHT;
        case 'Revoked':
        case 'WrittenOff':
            return TagVariant.WARNING;
        default:
            return TagVariant.DEFAULT;
    }
};

export const getRepaymentPeriodEndDate = (repaymentPeriodLeft: number) => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + repaymentPeriodLeft);
    return endDate;
};

export const getGrantConfig = (grant: IGrant) => {
    const isGrantActive = grant.status === 'Active';
    const isGrantActiveOrRepaid = isGrantActive || grant.status === 'Repaid';

    return {
        amount: getAmount(grant),
        isAmountColorSecondary: !isGrantActive,
        isBackgroundFilled: getIsBackgroundFilled(grant.status),
        isLabelColorSecondary: isGrantActiveOrRepaid,
        isProgressBarVisible: isGrantActive,
        labelKey: getLabelKey(grant),
        repaymentPeriodEndDate: getRepaymentPeriodEndDate(grant.repaymentPeriodLeft),
        statusKey: getStatusKey(grant.status),
        statusTagVariant: getStatusTagVariant(grant.status),
    };
};
