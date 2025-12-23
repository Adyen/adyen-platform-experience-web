import { type ExternalUIComponentProps, PayByLinkSettingsComponentProps } from '../../../../../types';
import './PayByLinkSettingsContainer.scss';
import { PayByLinkSettingsProvider } from './context/context';
import PayByLinkWrapper from './PayByLinkSettingsWrapper';

const PayByLinkSettingsContainer = (props: ExternalUIComponentProps<PayByLinkSettingsComponentProps>) => {
    return (
        <PayByLinkSettingsProvider>
            <PayByLinkWrapper {...props} />
        </PayByLinkSettingsProvider>
    );
};

export default PayByLinkSettingsContainer;
