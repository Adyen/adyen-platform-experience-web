import { useCallback, useState } from 'preact/hooks';
import { DisputeContextProvider } from '../../context/dispute/context';
import { DisputeDetailsContainer } from '../DisputeDetailsContainer/DisputeDetailsContainer';
import type { ExternalUIComponentProps } from '../../../../types';
import { DisputeManagementProps } from '../../types';
import { IDisputeDetail } from '../../../../../types/api/models/disputes';

export const DisputeDetails = (props: ExternalUIComponentProps<DisputeManagementProps>) => {
    const [dispute, setDispute] = useState<IDisputeDetail | undefined>();

    const setDisputeCallback = useCallback((dispute: IDisputeDetail | undefined) => {
        setDispute(dispute);
    }, []);

    return (
        <DisputeContextProvider dispute={dispute} setDispute={setDisputeCallback}>
            <DisputeDetailsContainer
                disputeId={props.id}
                onAcceptDispute={props.onAcceptDispute}
                onDefendDispute={props.onDefendDispute}
                dataCustomization={props.dataCustomization}
            />
        </DisputeContextProvider>
    );
};
