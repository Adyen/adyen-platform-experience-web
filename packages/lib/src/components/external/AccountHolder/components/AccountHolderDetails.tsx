import Status from '@src/components/internal/Status';
import ContactDetails from './ContactDetails';
import StatsBar from '@src/components/internal/StatsBar';
import './AccountHolderDetails.scss';
import { AccountHolderComponentProps } from '../types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { AccountHolder } from '@src/types';
import Spinner from '@src/components/internal/Spinner';
import Alert from '@src/components/internal/Alert';

const AccountHolderDetails = ({ accountHolderId, accountHolder }: AccountHolderComponentProps) => {
    const { i18n } = useCoreContext();

    const { data, error, isFetching } = useFetch<AccountHolder>(
        { url: `accountHolders/${accountHolderId}` },
        { enabled: !!accountHolderId && !accountHolder }
    );

    const accountHolderData = accountHolder ?? data;

    return (
        <div className="adyen-fp-account-holder">
            <h1 className="adyen-fp-title">{i18n.get('accountHolder')}</h1>

            {!data && isFetching ? (
                <Spinner />
            ) : error ? (
                <Alert icon={'cross'}>{error.message ?? i18n.get('unableToLoadAccountHolder')}</Alert>
            ) : accountHolderData ? (
                <>
                    <div className="adyen-fp-details-container">
                        <StatsBar
                            items={[
                                {
                                    label: 'Account holder ID',
                                    value: accountHolderData?.id,
                                },
                                {
                                    label: 'Status',
                                    value: <Status type={'success'} label={accountHolderData.status} />,
                                },
                            ]}
                        />

                        <div className="adyen-fp-details-section">
                            <div className="adyen-fp-account-holder__legal-entity">
                                <div className="adyen-fp-subtitle">{i18n.get('legalEntity')}</div>

                                <div className="adyen-fp-field">
                                    <div className="adyen-fp-label">{i18n.get('legalEntityID')}</div>
                                    <div className="adyen-fp-value">{accountHolderData.legalEntityId}</div>
                                </div>

                                <div className="adyen-fp-field">
                                    <div className="adyen-fp-label">{i18n.get('description')}</div>
                                    <div className="adyen-fp-value">{accountHolderData.description}</div>
                                </div>
                            </div>

                            {!!accountHolderData.contactDetails && (
                                <ContactDetails
                                    address={accountHolderData.contactDetails.address}
                                    phoneNumber={accountHolderData.contactDetails.phone}
                                    emailAddress={accountHolderData.contactDetails?.email}
                                />
                            )}
                        </div>
                    </div>

                    <pre>
                        <code>{JSON.stringify(accountHolderData, null, 2)}</code>
                    </pre>
                </>
            ) : null}
        </div>
    );
};

export default AccountHolderDetails;
