import Status from 'src/components/internal/Status';
import ContactDetails from './ContactDetails';
import StatsBar from 'src/components/internal/StatsBar';
import './AccountHolderDetails.scss';

function BalanceAccountDetails({ accountHolder }) {
    return (
        <div class="adyen-fp-account-holder">
            <p class="adyen-fp-title">Account holder</p>

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
                    <div class="adyen-fp-account-holder__legal-entity">
                        <div class="adyen-fp-subtitle">Legal entity</div>

                        <div class="adyen-fp-field">
                            <div class="adyen-fp-label">Legal entity ID</div>
                            <div class="adyen-fp-value">{accountHolder.legalEntityId}</div>
                        </div>

                        <div class="adyen-fp-field">
                            <div class="adyen-fp-label">Description</div>
                            <div class="adyen-fp-value">{accountHolder.description}</div>
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
