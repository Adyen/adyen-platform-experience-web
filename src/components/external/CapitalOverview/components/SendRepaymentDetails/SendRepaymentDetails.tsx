import { FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import { getGrantConfig } from '../GrantItem/utils';
import { Translation } from '../../../../internal/Translation';
import { EMPTY_ARRAY } from '../../../../../utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import InfoBox from '../../../../internal/InfoBox';
import type { GrantDetailsViewProps } from '../GrantDetailsView/types';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { AccountDetails } from '../AccountDetails/AccountDetails';
import { GrantDetailsView } from '../GrantDetailsView/GrantDetailsView';
import './SendRepaymentDetails.scss';

const BASE_CLASS = 'adyen-pe-grant-send-repayment-details';

const CLASS_NAMES = {
    balanceInfo: `${BASE_CLASS}__balance-info`,
    repaymentInfo: `${BASE_CLASS}__repayment-info`,
    repaymentAccount: `${BASE_CLASS}__repayment-account`,
    repaymentNotice: `${BASE_CLASS}__repayment-notice`,
};

export const SendRepaymentDetails: FunctionalComponent<GrantDetailsViewProps> = ({ grant, onDetailsClose }) => {
    const { i18n } = useCoreContext();
    const grantConfig = useMemo(() => getGrantConfig(grant), [grant]);
    const bankAccounts = useMemo(() => grant.unscheduledRepaymentAccounts ?? EMPTY_ARRAY, [grant.unscheduledRepaymentAccounts]);

    const formattedRemainingAmount = useMemo(() => {
        const { currency, value } = grantConfig.amount;
        return i18n.amount(value, currency).replace(/\D00$/, '');
    }, [i18n, grantConfig]);

    if (!bankAccounts.length) return null;

    return (
        <GrantDetailsView
            className={BASE_CLASS}
            onDetailsClose={onDetailsClose}
            headerTitleKey="capital.sendRepayment"
            headerSubtitleKey="capital.sendRepaymentSubtitle"
        >
            <div className={CLASS_NAMES.repaymentInfo}>
                <section className={CLASS_NAMES.repaymentAccount}>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {i18n.get('capital.bankAccountDetails')}
                    </Typography>
                    <AccountDetails bankAccount={bankAccounts[0]!} />
                </section>
                <section className={CLASS_NAMES.repaymentNotice}>
                    <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.CAPTION}>
                        {i18n.get('capital.sendRepaymentNotice')}
                    </Typography>
                </section>
            </div>
            <InfoBox className={CLASS_NAMES.balanceInfo}>
                <Typography variant={TypographyVariant.BODY}>
                    <Translation
                        translationKey="capital.repaymentBalanceInfo"
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
        </GrantDetailsView>
    );
};
