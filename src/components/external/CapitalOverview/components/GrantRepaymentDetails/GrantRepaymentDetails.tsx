import { FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import { Translation } from '../../../../internal/Translation';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import InfoBox from '../../../../internal/InfoBox';
import type { GrantAdjustmentDetailsProps } from '../GrantAdjustmentDetails/types';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { AccountDetails } from '../AccountDetails/AccountDetails';
import { GrantAdjustmentDetails } from '../GrantAdjustmentDetails/GrantAdjustmentDetails';
import './GrantRepaymentDetails.scss';

const BASE_CLASS = 'adyen-pe-grant-repayment-details';

const CLASS_NAMES = {
    balanceInfo: `${BASE_CLASS}__balance-info`,
    repaymentInfo: `${BASE_CLASS}__repayment-info`,
    repaymentAccount: `${BASE_CLASS}__repayment-account`,
    repaymentNotice: `${BASE_CLASS}__repayment-notice`,
};

export const GrantRepaymentDetails: FunctionalComponent<GrantAdjustmentDetailsProps> = ({ grant, onDetailsClose }) => {
    const { i18n } = useCoreContext();

    const bankAccount = useMemo(() => {
        // There can be more than one unscheduled repayment account, however, we are only showing the first one.
        // If there be any need to show the rest of them in the future, some updates will be required.
        return grant.unscheduledRepaymentAccounts?.[0];
    }, [grant.unscheduledRepaymentAccounts]);

    const formattedRemainingAmount = useMemo(() => {
        const { currency, value } = grant.remainingTotalAmount;
        return i18n.amount(value, currency);
    }, [i18n, grant.remainingTotalAmount]);

    return bankAccount ? (
        <GrantAdjustmentDetails
            className={BASE_CLASS}
            onDetailsClose={onDetailsClose}
            headerTitleKey="capital.overview.sendRepayment.title"
            headerSubtitleKey="capital.overview.sendRepayment.instruction"
        >
            <div className={CLASS_NAMES.repaymentInfo}>
                <div className={CLASS_NAMES.repaymentAccount}>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {i18n.get('capital.overview.sendRepayment.accountDetails.title')}
                    </Typography>
                    <AccountDetails bankAccount={bankAccount} />
                </div>
                <div className={CLASS_NAMES.repaymentNotice}>
                    <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.CAPTION}>
                        {i18n.get('capital.overview.sendRepayment.repaymentInfo')}
                    </Typography>
                </div>
            </div>
            <InfoBox className={CLASS_NAMES.balanceInfo}>
                <Typography variant={TypographyVariant.BODY}>
                    <Translation
                        translationKey="capital.overview.sendRepayment.remainingAmountInfo"
                        fills={{
                            amount: (
                                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} strongest>
                                    {formattedRemainingAmount}
                                </Typography>
                            ),
                        }}
                    />
                </Typography>
            </InfoBox>
        </GrantAdjustmentDetails>
    ) : null;
};
