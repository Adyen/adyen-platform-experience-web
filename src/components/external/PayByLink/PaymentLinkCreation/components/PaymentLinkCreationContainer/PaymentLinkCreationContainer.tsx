import { ExternalUIComponentProps, PaymentLinkCreationComponentProps } from '../../../../../types';
import { PaymentLinkCreationFormContainer } from '../PaymentLinkCreationFormContainer/PaymentLinkCreationFormContainer';
import '../../PaymentLinkCreation.scss';
import { useState } from 'preact/hooks';
import { FormSuccess } from '../Form/FormSuccess/FormSuccess';
import { PaymentLinkDetails } from '../../../PaymentLinkDetails/components/PaymentLinkDetails/PaymentLinkDetails';

type PaymentLinkCreationState = 'Creation' | 'Success' | 'Details';

const PaymentLinkCreationContainer = (props: ExternalUIComponentProps<PaymentLinkCreationComponentProps> & { embeddedInOverview?: boolean }) => {
    const [state, setState] = useState<PaymentLinkCreationState>('Creation');
    const [paymentLinkUrl, setPaymentLinkUrl] = useState<string>('');
    const [paymentLinkId, setPaymentLinkId] = useState<string>('');

    return (
        <div className="adyen-pe-payment-link-creation">
            {(() => {
                switch (state) {
                    case 'Creation':
                        return (
                            <PaymentLinkCreationFormContainer
                                {...props}
                                onPaymentLinkCreated={data => {
                                    props.onPaymentLinkCreated?.(data);
                                    setPaymentLinkUrl(data.paymentLink?.url ?? '');
                                    setPaymentLinkId(data.paymentLink?.paymentLinkId ?? '');
                                    setState('Success');
                                }}
                            />
                        );
                    case 'Success':
                        return (
                            <div>
                                <FormSuccess paymentLinkUrl={paymentLinkUrl} onGoToDetails={() => setState('Details')} />
                            </div>
                        );
                    case 'Details':
                        return <PaymentLinkDetails id={paymentLinkId} />;
                    default:
                        return null;
                }
            })()}
        </div>
    );
};

export default PaymentLinkCreationContainer;
