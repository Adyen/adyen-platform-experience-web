import { useCallback, useEffect, useState } from 'preact/hooks';
import { FC, PropsWithChildren } from 'preact/compat';
import Modal from '../../../../internal/Modal';
import { DisputeDetailsCustomization } from '../../../DisputeManagement';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { popoverUtil } from '../../../../internal/Popover/utils/popoverUtil';
import useModalDetails from '../../../../../hooks/useModalDetails';
import { DISPUTE_INTERNAL_SYMBOL } from '../../../../utils/disputes/constants';
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

    const onCloseCallback = useCallback(() => {
        if (disputeManagementSuccessful) {
            setDisputeManagementSuccessful(false);
            refreshDisputesList('CHARGEBACKS');
        }
        resetDetails();
    }, [disputeManagementSuccessful, refreshDisputesList, resetDetails]);

    const onDisputeManagementSuccessful = useCallback(() => {
        setDisputeManagementSuccessful(true);
        return DISPUTE_INTERNAL_SYMBOL;
    }, []);

    useEffect(() => {
        if (isModalOpen) popoverUtil.closeAll();
    }, [isModalOpen]);

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
                            onDisputeAccept={onDisputeManagementSuccessful}
                            onDisputeDefend={onDisputeManagementSuccessful}
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
