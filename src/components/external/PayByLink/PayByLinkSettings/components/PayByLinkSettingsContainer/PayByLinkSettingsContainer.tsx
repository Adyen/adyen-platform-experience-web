import { _UIComponentProps, PayByLinkSettingsComponentProps } from '../../../../../types';
import './PayByLinkSettingsContainer.scss';
import { PayByLinkSettingsProvider } from './context/context';
import PayByLinkWrapper from './PayByLinkWrapper';

const PayByLinkSettingsContainer = (props: _UIComponentProps<PayByLinkSettingsComponentProps>) => {
    return (
        <PayByLinkSettingsProvider>
            <PayByLinkWrapper {...props} />
        </PayByLinkSettingsProvider>
    );
};

export default PayByLinkSettingsContainer;
