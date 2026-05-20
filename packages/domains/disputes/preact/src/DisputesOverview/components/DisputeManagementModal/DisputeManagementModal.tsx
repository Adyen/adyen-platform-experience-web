import { useCallback, useEffect, useState } from 'preact/hooks';
import { FC, PropsWithChildren } from 'preact/compat';
import Modal from '@integration-components/ui-components-preact/Modal';
import { DisputeDetailsCustomization } from '../../../DisputeManagement';
import { useCoreContext } from '@integration-components/core/preact';
import { popoverUtil } from '@integration-components/ui-components-preact/Popover/utils/popoverUtil';
import useModalDetails from '@integration-components/hooks-preact/useModalDetails';
import { IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import { DisputeDetailsContainer } from '../../../DisputeManagement/components/DisputeDetailsContainer/DisputeDetailsContainer';

export interface DisputeManagementModalProps {
    setModalVisible: (modalVisible: boolean) => void;
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
    setModalVisible,
}: PropsWithChildren<DisputeManagementModalProps>) => {
    const { i18n } = useCoreContext();
    const [disputeManagementSuccessful, setDisputeManagementSuccessful] = useState(false);
    const isModalOpen = !!selectedDetail;

    const onCloseCallback = useCallback(() => {
        if (disputeManagementSuccessful) {
            setDisputeManagementSuccessful(false);
            refreshDisputesList('CHARGEBACKS');
        }
        setModalVisible(false);
        resetDetails();
    }, [disputeManagementSuccessful, refreshDisputesList, resetDetails, setModalVisible]);

    const onDisputeManagementSuccessful = useCallback(() => {
        setDisputeManagementSuccessful(true);
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            setModalVisible(true);
            popoverUtil.closeAll();
        }
    }, [isModalOpen, setModalVisible]);

    return (
        <div>
            {children}
            {selectedDetail && (
                <Modal
                    isOpen={isModalOpen}
                    aria-label={i18n.get('disputes.management.common.title')}
                    onClose={onCloseCallback}
                    isDismissible={true}
                    headerWithBorder={false}
                    size={selectedDetail.modalSize || 'large'}
                >
                    <DisputeDetailsContainer
                        id={selectedDetail.selection.data}
                        dataCustomization={dataCustomization}
                        onDisputeAccept={onDisputeManagementSuccessful}
                        onDisputeDefend={onDisputeManagementSuccessful}
                        onContactSupport={onContactSupport}
                        onDismiss={resetDetails}
                        hideTitle
                    />
                </Modal>
            )}
        </div>
    );
};
