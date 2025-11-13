import { _UIComponentProps, PayByLinkCreationComponentProps } from '../../../../../types';
import { PayByLinkCreationFormContainer } from '../PayByLinkCreationFormContainer/PayByLinkCreationFormContainer';
import '../../PayByLinkCreation.scss';
import { useState } from 'preact/hooks';
import { FormSuccess } from '../Form/FormSuccess/FormSuccess';
import { SuccessResponse } from '../../../../../../types/api/endpoints';

type PayByLinkCreationState = 'Creation' | 'Success' | 'Details';

const PayByLinkCreationContainer = (props: _UIComponentProps<PayByLinkCreationComponentProps>) => {
    const [state, setState] = useState<PayByLinkCreationState>('Creation');
    const [creationResult, setCreationResult] = useState<SuccessResponse<'createPayByLinkConfiguration'> | null>(null);

    return (
        <div className="adyen-pe-pay-by-link-creation">
            {(() => {
                switch (state) {
                    case 'Creation':
                        return (
                            <PayByLinkCreationFormContainer
                                onSubmitted={result => {
                                    setCreationResult(result);
                                    setState('Success');
                                }}
                            />
                        );
                    case 'Success':
                        return (
                            <div>
                                <FormSuccess paymentLinkId={creationResult?.paymentLinkId || ''} onGoToDetails={() => setState('Details')} />
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
