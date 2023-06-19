import Status from '@src/components/internal/Status';
import ContactDetails from './ContactDetails';
import StatsBar from '@src/components/internal/StatsBar';
import './AccountHolderDetails.scss';
import { AccountHolderDetailsProps } from '../types';
import useCoreContext from '@src/core/Context/useCoreContext';

const AccountHolderDetails = ({ accountHolder }: AccountHolderDetailsProps) => {
    const { i18n } = useCoreContext();

    return (
        <div className="adyen-fp-account-holder">
            <h1 className="adyen-fp-title">{i18n.get('accountHolder')}</h1>

            <div className="adyen-fp-details-container">
                <StatsBar
                    featured={true}
                    items={[
                        {
                            label: 'Account holder ID',
                            value: accountHolder.id,
                        },
                        {
                            label: 'Status',
                            value: <Status type={'success'} label={accountHolder.status} />,
                        },
                    ]}
                />

                <div className="adyen-fp-details-section">
                    <div className="adyen-fp-account-holder__legal-entity">
                        <div className="adyen-fp-subtitle">{i18n.get('legalEntity')}</div>

                        <div className="adyen-fp-field">
                            <div className="adyen-fp-label">{i18n.get('legalEntityID')}</div>
                            <div className="adyen-fp-value">{accountHolder.legalEntityId}</div>
                        </div>

                        <div className="adyen-fp-field">
                            <div className="adyen-fp-label">{i18n.get('description')}</div>
                            <div className="adyen-fp-value">{accountHolder.description}</div>
                        </div>
                    </div>

                    {!!accountHolder.contactDetails && (
                        <ContactDetails
                            address={accountHolder.contactDetails.address}
                            phoneNumber={accountHolder.contactDetails.phone}
                            emailAddress={accountHolder.contactDetails?.email}
                        />
                    )}
                </div>
            </div>

            <pre>
                <code>{JSON.stringify(accountHolder, null, 2)}</code>
            </pre>
        </div>
    );
};

export default AccountHolderDetails;
