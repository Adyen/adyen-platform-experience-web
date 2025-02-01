import { FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import { getGrantConfig } from '../GrantItem/utils';
import { GrantDetailsViewHeader } from './GrantDetailsViewHeader';
import { Translation } from '../../../../internal/Translation';
import { EMPTY_ARRAY, EMPTY_OBJECT } from '../../../../../utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import CopyText from '../../../../internal/CopyText/CopyText';
import InfoBox from '../../../../internal/InfoBox';
import type { GrantDetailsViewProps } from './types';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { TranslationKey } from '../../../../../translations';
import './GrantDetails.scss';

const BASE_CLASS = 'adyen-pe-grant-early-repayment-details';

const CLASS_NAMES = {
    base: BASE_CLASS,
    accountDescription: `${BASE_CLASS}__account-description`,
    accountDescriptionItem: `${BASE_CLASS}__account-description-item`,
    accountDescriptionLabel: `${BASE_CLASS}__account-description-label`,
    balanceInfo: `${BASE_CLASS}__balance-info`,
    repaymentAccount: `${BASE_CLASS}__repayment-account`,
    repaymentNotice: `${BASE_CLASS}__repayment-notice`,
};

type AccountDescriptionItemProps = {
    copyConfig?: Partial<Pick<Parameters<typeof CopyText>[0], 'buttonLabel' | 'textToCopy'>>;
    label: TranslationKey;
    value?: string;
};

const AccountDescriptionItem: FunctionalComponent<AccountDescriptionItemProps> = ({ copyConfig, label, value }) => {
    const { i18n } = useCoreContext();

    const isCopyText = useMemo(() => !!copyConfig, [copyConfig]);
    const valueText = useMemo(() => copyConfig?.buttonLabel ?? value, [copyConfig, value]);
    const textToCopy = useMemo(() => copyConfig?.textToCopy ?? valueText, [copyConfig, valueText]);

    return valueText == undefined ? null : (
        <div className={CLASS_NAMES.accountDescriptionItem}>
            <dt>
                <Typography className={CLASS_NAMES.accountDescriptionLabel} el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                    {i18n.get(label)}
                </Typography>
            </dt>
            <dd>
                {isCopyText ? (
                    <CopyText buttonLabel={valueText} textToCopy={textToCopy!} showCopyTextTooltip={false} type="Text" />
                ) : (
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                        {valueText}
                    </Typography>
                )}
            </dd>
        </div>
    );
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

    const { accountNumber, routingNumber, region, bankName } = bankAccounts[0]!;

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
                        {/* [TODO]: Create translation key */}
                        {i18n.get('Bank account details' as TranslationKey)}
                    </Typography>

                    <dl className={CLASS_NAMES.accountDescription}>
                        {accountNumber && (
                            <AccountDescriptionItem
                                label={'Account number' as TranslationKey} // [TODO]: Create translation key
                                value={accountNumber.replace(/([A-Z0-9]{4})/g, '$1 ')} // [TODO]: Create formatting helper
                                copyConfig={{ textToCopy: accountNumber }}
                            />
                        )}
                        {routingNumber && (
                            <AccountDescriptionItem
                                label={'Routing number' as TranslationKey} // [TODO]: Create translation key
                                value={routingNumber}
                                copyConfig={EMPTY_OBJECT}
                            />
                        )}
                        <AccountDescriptionItem
                            label={'Country/region' as TranslationKey} // [TODO]: Create translation key
                            value={region.replace(/^US$/, 'United States')} // [TODO]: Consider mapping helper
                        />
                        <AccountDescriptionItem
                            label={'Bank name' as TranslationKey} // [TODO]: Create translation key
                            value={bankName}
                        />
                    </dl>
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
