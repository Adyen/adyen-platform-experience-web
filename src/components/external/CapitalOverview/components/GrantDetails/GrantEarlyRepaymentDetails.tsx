import { FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import { getGrantConfig } from '../GrantItem/utils';
import { GrantDetailsViewHeader } from './GrantDetailsViewHeader';
import { Translation } from '../../../../internal/Translation';
import { EMPTY_ARRAY } from '../../../../../utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import InfoBox from '../../../../internal/InfoBox';
import type { GrantDetailsViewProps } from './types';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { BankAccountDescriptionList } from '../CapitalBankAccount/BankAccountDescriptionList';
import './GrantEarlyRepaymentDetails.scss';

const BASE_CLASS = 'adyen-pe-grant-early-repayment-details';

const CLASS_NAMES = {
    base: BASE_CLASS,
    balanceInfo: `${BASE_CLASS}__balance-info`,
    repaymentAccount: `${BASE_CLASS}__repayment-account`,
    repaymentNotice: `${BASE_CLASS}__repayment-notice`,
};

export const GrantEarlyRepaymentDetails: FunctionalComponent<GrantDetailsViewProps> = ({ grant, onDetailsClose }) => {
    const { i18n } = useCoreContext();
    const grantConfig = useMemo(() => getGrantConfig(grant), [grant]);
    const bankAccounts = useMemo(() => grant.earlyRepaymentAccounts ?? EMPTY_ARRAY, [grant.earlyRepaymentAccounts]);

    const formattedRemainingAmount = useMemo(() => {
        const { currency, value } = grantConfig.amount;
        return i18n.amount(value, currency).replace(/\D00$/, '');
    }, [i18n, grantConfig]);

    if (!bankAccounts.length) return null;

    return (
        <div className={CLASS_NAMES.base}>
            <GrantDetailsViewHeader
                onDetailsClose={onDetailsClose}
                titleKey={'capital.earlyRepayment'}
                subtitleKey={'capital.earlyRepaymentInstruction'}
            />
            <div>
                <section className={CLASS_NAMES.repaymentAccount}>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {i18n.get('capital.bankAccountDetails')}
                    </Typography>
                    <BankAccountDescriptionList bankAccount={bankAccounts[0]!} />
                </section>
                <section className={CLASS_NAMES.repaymentNotice}>
                    <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.CAPTION}>
                        {i18n.get('capital.earlyRepaymentNotice')}
                    </Typography>
                </section>
            </div>
            {grant.status === 'Active' && (
                <InfoBox className={CLASS_NAMES.balanceInfo}>
                    <Typography variant={TypographyVariant.BODY}>
                        <Translation
                            translationKey="capital.earlyRepaymentBalance"
                            fills={{
                                amount: (
                                    <Typography el={TypographyElement.STRONG} variant={TypographyVariant.BODY} strongest>
                                        {formattedRemainingAmount}
                                    </Typography>
                                ),
                            }}
                        />
                    </Typography>
                </InfoBox>
            )}
        </div>
    );
};
