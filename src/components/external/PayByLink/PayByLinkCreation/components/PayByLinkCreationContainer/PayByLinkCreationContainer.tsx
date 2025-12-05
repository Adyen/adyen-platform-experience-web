import { _UIComponentProps, PayByLinkCreationComponentProps } from '../../../../../types';
import { PayByLinkCreationFormContainer } from '../PayByLinkCreationFormContainer/PayByLinkCreationFormContainer';
import '../../PayByLinkCreation.scss';
import { useState } from 'preact/hooks';
import { FormSuccess } from '../Form/FormSuccess/FormSuccess';

type PayByLinkCreationState = 'Creation' | 'Success' | 'Details';

const PayByLinkCreationContainer = (props: _UIComponentProps<PayByLinkCreationComponentProps>) => {
    const [state, setState] = useState<PayByLinkCreationState>('Creation');
    const [paymentLinkUrl, setPaymentLinkUrl] = useState<string>('');

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
                        return <div>{'Details screen'}</div>;
                    default:
                        return null;
                }
            })()}
        </div>
    );
};

export default PayByLinkCreationContainer;
