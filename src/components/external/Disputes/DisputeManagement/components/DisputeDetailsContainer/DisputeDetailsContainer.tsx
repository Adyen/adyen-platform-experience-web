import { useCallback, useState } from 'preact/hooks';
import { DisputeContextProvider } from '../../context/dispute/context';
import { DisputeDetails } from '../DisputeDetails/DisputeDetails';
import type { ExternalUIComponentProps } from '../../../../../types';
import { DisputeManagementProps } from '../../types';
import { IDisputeDetail } from '../../../../../../types/api/models/disputes';
import './DisputeDetailsContainer.scss';

export const DisputeDetailsContainer = (props: ExternalUIComponentProps<DisputeManagementProps>) => {
    const [dispute, setDispute] = useState<IDisputeDetail | undefined>();

    const setDisputeCallback = useCallback((dispute: IDisputeDetail | undefined) => {
        setDispute(dispute);
    }, []);

    return (
        <DisputeContextProvider dispute={dispute} setDispute={setDisputeCallback}>
            <div className="adyen-pe-dispute__container">
                <DisputeDetails {...props} />
            </div>
        </DisputeContextProvider>
    );
};
