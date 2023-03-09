import './ContactDetails.scss';

export default function ContactDetails({ address, phoneNumber, emailAddress }) {
    return (
        <div class="adyen-fp-contact-details">
            <div class="adyen-fp-subtitle">Contact details</div>
            {!!phoneNumber && (
                <div className="adyen-fp-contact-details adyen-fp-contact-details--phone">{phoneNumber}</div>
            )}

            {!!emailAddress && (
                <div className="adyen-fp-contact-details adyen-fp-contact-details--email">{emailAddress}</div>
            )}

            {!!address && (
                <div className="adyen-fp-contact-details adyen-fp-contact-details--address">
                    <div className="adyen-fp-contact-details__address-line">
                        {address.street} {address.houseNumberOrName}, {address.postalCode}
                    </div>
                    <div className="adyen-fp-contact-details__address-line">
                        {address.city}, {address.country}
                    </div>
                </div>
            )}
        </div>
    );
}