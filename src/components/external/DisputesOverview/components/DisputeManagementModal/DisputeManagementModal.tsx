import { useCallback, useEffect, useState } from 'preact/hooks';
import { FC, PropsWithChildren } from 'preact/compat';
import Modal from '../../../../internal/Modal';
import { DisputeDetailsCustomization, DisputeManagementProps } from '../../../DisputeManagement';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { popoverUtil } from '../../../../internal/Popover/utils/popoverUtil';
import useModalDetails from '../../../../../hooks/useModalDetails';
import { IDisputeStatusGroup } from '../../../../../types/api/models/disputes';
import { DisputeDetailsContainer } from '../../../DisputeManagement/components/DisputeDetailsContainer/DisputeDetailsContainer';
import './DisputeManagementModal.scss';

export interface DisputeManagementModalProps {
    refreshDisputesList: (statusGroup?: IDisputeStatusGroup) => void;
    selectedDetail: ReturnType<typeof useModalDetails>['selectedDetail'];
    resetDetails: ReturnType<typeof useModalDetails>['resetDetails'];
    dataCustomization?: { details: DisputeDetailsCustomization };
    onContactSupport?: () => void;
}

export const DisputeManagementModal: FC<DisputeManagementModalProps> = ({
    children,
    selectedDetail,
    resetDetails,
    dataCustomization,
    onContactSupport,
    refreshDisputesList,
}: PropsWithChildren<DisputeManagementModalProps>) => {
    const { i18n } = useCoreContext();
    const [disputeManagementSuccessful, setDisputeManagementSuccessful] = useState(false);
    const isModalOpen = !!selectedDetail;

    useEffect(() => {
        if (isModalOpen) {
            popoverUtil.closeAll();
        }
    }, [isModalOpen]);

    const onAcceptDisputeCallback = useCallback<NonNullable<DisputeManagementProps['onDisputeAccept']>>(() => {
        setDisputeManagementSuccessful(true);
    }, []);

    const onDefendDisputeCallback = useCallback<NonNullable<DisputeManagementProps['onDisputeDefend']>>(() => {
        setDisputeManagementSuccessful(true);
    }, []);

    const onCloseCallback = useCallback(() => {
        if (disputeManagementSuccessful) {
            setDisputeManagementSuccessful(false);
            refreshDisputesList('CHARGEBACKS');
        }
        resetDetails();
    }, [disputeManagementSuccessful, refreshDisputesList, resetDetails]);

    return (
        <div>
            {children}
            {selectedDetail && (
                <Modal
                    isOpen={!!selectedDetail}
                    aria-label={i18n.get('disputes.disputeManagementTitle')}
                    onClose={onCloseCallback}
                    isDismissible={true}
                    headerWithBorder={false}
                    size={selectedDetail.modalSize || 'large'}
                >
                    <div className="adyen-pe-dispute-management-modal-content">
                        <DisputeDetailsContainer
                            id={selectedDetail.selection.data}
                            dataCustomization={dataCustomization}
                            onDisputeAccept={onAcceptDisputeCallback}
                            onDisputeDefend={onDefendDisputeCallback}
                            onContactSupport={onContactSupport}
                            onDismiss={resetDetails}
                            hideTitle
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};
