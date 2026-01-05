import { ExternalUIComponentProps, PayByLinkCreationComponentProps } from '../../../../../types';
import { PayByLinkCreationFormContainer } from '../PayByLinkCreationFormContainer/PayByLinkCreationFormContainer';
import '../../PayByLinkCreation.scss';
import { useState } from 'preact/hooks';
import { FormSuccess } from '../Form/FormSuccess/FormSuccess';
import { PaymentLinkDetails } from '../../../../PaymentLinkDetails/components/PaymentLinkDetails/PaymentLinkDetails';

type PayByLinkCreationState = 'Creation' | 'Success' | 'Details';

const PayByLinkCreationContainer = (props: ExternalUIComponentProps<PayByLinkCreationComponentProps> & { embeddedInOverview?: boolean }) => {
    const [state, setState] = useState<PayByLinkCreationState>('Creation');
    const [paymentLinkUrl, setPaymentLinkUrl] = useState<string>('');
    const [paymentLinkId, setPaymentLinkId] = useState<string>('');

    return (
        <div className="adyen-pe-pay-by-link-creation">
            {(() => {
                switch (state) {
                    case 'Creation':
                        return (
                            <PayByLinkCreationFormContainer
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

export default PayByLinkCreationContainer;
