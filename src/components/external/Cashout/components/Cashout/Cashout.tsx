import { FunctionalComponent } from 'preact';
import { CashoutOverview } from '../CashoutOverview/CashoutOverview';
import { ExternalUIComponentProps } from '../../../../types';
import { CashoutProps } from '../../types';

export const Cashout: FunctionalComponent<ExternalUIComponentProps<CashoutProps>> = ({ accountKey, variant }) => {
    return <CashoutOverview accountKey={accountKey} variant={variant} />;
};
