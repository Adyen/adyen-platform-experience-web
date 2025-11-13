import { _UIComponentProps, PayByLinkCreationComponentProps } from '../../../../../types';
import { PayByLinkCreationFormContainer } from '../PayByLinkCreationFormContainer/PayByLinkCreationFormContainer';
import '../../PayByLinkCreation.scss';
import { useState } from 'preact/hooks';
import Button from '../../../../../internal/Button';

type PayByLinkCreationState = 'Creation' | 'Success' | 'Details';

const PayByLinkCreationContainer = (props: _UIComponentProps<PayByLinkCreationComponentProps>) => {
    const [state, setState] = useState<PayByLinkCreationState>('Creation');

    return (
        <div className="adyen-pe-pay-by-link-creation">
            {(() => {
                switch (state) {
                    case 'Creation':
                        return <PayByLinkCreationFormContainer onSubmitted={() => setState('Success')} />;
                    case 'Success':
                        return (
                            <div>
                                {'Success screen'}
                                <Button onClick={() => setState('Details')}>{'See details'}</Button>
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
