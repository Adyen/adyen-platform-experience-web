import Status from 'src/components/internal/Status';
import ContactDetails from './ContactDetails';
import StatsBar from 'src/components/internal/StatsBar';
import './AccountHolderDetails.scss';

function BalanceAccountDetails({ accountHolder }) {
    return (
        <div className="adyen-fp-account-holder">
            <p className="adyen-fp-title">Account holder</p>

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
                        <div className="adyen-fp-subtitle">Legal entity</div>

                        <div className="adyen-fp-field">
                            <div className="adyen-fp-label">Legal entity ID</div>
                            <div className="adyen-fp-value">{accountHolder.legalEntityId}</div>
                        </div>

                        <div className="adyen-fp-field">
                            <div className="adyen-fp-label">Description</div>
                            <div className="adyen-fp-value">{accountHolder.description}</div>
                        </div>
                    </div>

                    {!!accountHolder.contactDetails && (
                        <ContactDetails
                            address={accountHolder.contactDetails.address}
                            phoneNumber={accountHolder.contactDetails.phone?.number}
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
}

export default BalanceAccountDetails;
