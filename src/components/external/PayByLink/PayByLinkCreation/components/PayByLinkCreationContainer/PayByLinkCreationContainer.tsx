import { _UIComponentProps, PayByLinkCreationComponentProps } from '../../../../../types';
import { PayByLinkCreationFormContainer } from '../PayByLinkCreationFormContainer/PayByLinkCreationFormContainer';
import '../../PayByLinkCreation.scss';

const PayByLinkCreationContainer = (props: _UIComponentProps<PayByLinkCreationComponentProps>) => {
    return (
        <div className="adyen-pe-pay-by-link-creation">
            <PayByLinkCreationFormContainer />
        </div>
    );
};

export default PayByLinkCreationContainer;
