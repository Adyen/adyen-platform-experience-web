import { FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import useUniqueId from '../../../../../../hooks/useUniqueId';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import type { GrantAdjustmentDetailsProps } from '../GrantAdjustmentDetails/types';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import { AccountDetails } from '../AccountDetails/AccountDetails';
import { GrantAdjustmentDetails } from '../GrantAdjustmentDetails/GrantAdjustmentDetails';
import './GrantRepaymentDetails.scss';
import { Divider } from '../../../../../internal/Divider/Divider';
import { Translation } from '../../../../../internal/Translation';

const BASE_CLASS = 'adyen-pe-grant-repayment-details';

const CLASS_NAMES = {
    instructionList: `${BASE_CLASS}__instruction-list`,
    notice: `${BASE_CLASS}__notice`,
    repaymentAccount: `${BASE_CLASS}__repayment-account`,
    transferInstrumentItem: `${BASE_CLASS}__transfer-instrument-item`,
    transferInstrumentList: `${BASE_CLASS}__transfer-instrument-list`,
    verifiedBankAccountDetails: `${BASE_CLASS}__verified-bank-account-details`,
};

export const GrantRepaymentDetails: FunctionalComponent<GrantAdjustmentDetailsProps> = ({ grant, onDetailsClose }) => {
    const { i18n } = useCoreContext();

    const repaymentAccountDetailsLabelElemId = `list-${useUniqueId()}`;
    const repaymentInstructionsLabelElemId = `list-${useUniqueId()}`;
    const transferInstrumentsLabelElemId = `list-${useUniqueId()}`;

    const bankAccount = useMemo(() => {
        // There can be more than one unscheduled repayment account, however, we are only showing the first one.
        // If there be any need to show the rest of them in the future, some updates will be required.
        return grant.unscheduledRepaymentAccounts?.[0];
    }, [grant.unscheduledRepaymentAccounts]);

    return bankAccount ? (
        <GrantAdjustmentDetails
            className={BASE_CLASS}
            onDetailsClose={onDetailsClose}
            headerTitleKey="capital.overview.repayment.title"
            headerSubtitleKey="capital.overview.repayment.subtitle"
        >
            <div className={CLASS_NAMES.repaymentAccount}>
                <Typography id={repaymentAccountDetailsLabelElemId} el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {i18n.get('capital.overview.repayment.accountDetails.title')}
                </Typography>
                <AccountDetails bankAccount={bankAccount} aria-labelledby={repaymentAccountDetailsLabelElemId} />
            </div>
            <div className={CLASS_NAMES.notice}>
                {!!grant.transferInstruments?.length && (
                    <>
                        <div>
                            <Typography id={transferInstrumentsLabelElemId} el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} stronger>
                                {i18n.get('capital.overview.repayment.transferInstruments')}
                            </Typography>

                            <ul className={CLASS_NAMES.transferInstrumentList} aria-labelledby={transferInstrumentsLabelElemId}>
                                {grant.transferInstruments?.map(({ accountIdentifier }) => (
                                    <li key={accountIdentifier} className={CLASS_NAMES.transferInstrumentItem}>
                                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                                            {accountIdentifier}
                                        </Typography>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Divider />
                    </>
                )}
                <div>
                    <Typography id={repaymentInstructionsLabelElemId} el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} stronger>
                        {i18n.get('capital.overview.repayment.instructions.title')}
                    </Typography>
                    <ol className={CLASS_NAMES.instructionList} aria-labelledby={repaymentInstructionsLabelElemId}>
                        <li>
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                                <Translation
                                    translationKey={'capital.overview.repayment.instructions.addingBeneficiary'}
                                    fills={{
                                        beneficiaryName: (
                                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} stronger>
                                                {bankAccount.beneficiaryName}
                                            </Typography>
                                        ),
                                    }}
                                />
                            </Typography>
                        </li>
                        <li>
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                                {i18n.get('capital.overview.repayment.instructions.sendingPayment')}
                            </Typography>
                        </li>
                        <li>
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                                {i18n.get('capital.overview.repayment.instructions.waiting')}
                            </Typography>
                        </li>
                    </ol>
                </div>
                <Typography className={CLASS_NAMES.verifiedBankAccountDetails} el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                    {i18n.get('capital.overview.repayment.instructions.verifiedAccount')}
                </Typography>
            </div>
        </GrantAdjustmentDetails>
    ) : null;
};
