import './ContactDetails.scss';
import { AccountHolder } from '../../../../types';
import useCoreContext from '@src/core/Context/useCoreContext';

type ContactDetails = NonNullable<AccountHolder['contactDetails']>;
interface ContactDetailsProps {
    address?: ContactDetails['address'];
    phoneNumber?: ContactDetails['phone'];
    emailAddress?: ContactDetails['email'];
}
export default function ContactDetails({ address, phoneNumber, emailAddress }: ContactDetailsProps) {
    const { i18n } = useCoreContext();
    return (
        <div className="adyen-fp-contact-details">
            <div className="adyen-fp-subtitle">{i18n.get('contactDetails')}</div>
            {!!phoneNumber && <div className="adyen-fp-contact-details adyen-fp-contact-details--phone">{phoneNumber.number}</div>}

            {!!emailAddress && <div className="adyen-fp-contact-details adyen-fp-contact-details--email">{emailAddress}</div>}

            {!!address && (
                <div className="adyen-fp-contact-details adyen-fp-contact-details--address">
                    <div className="adyen-fp-contact-details__address-line">
                        {`${address.street} ${address.houseNumberOrName}, ${address.postalCode}`}
                    </div>
                    <div className="adyen-fp-contact-details__address-line">{`${address.city}, ${address.country}`}</div>
                </div>
            )}
        </div>
    );
}
