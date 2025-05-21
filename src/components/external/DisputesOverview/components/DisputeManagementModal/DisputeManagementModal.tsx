import { useCallback, useEffect, useState } from 'preact/hooks';
import { FC, PropsWithChildren } from 'preact/compat';
import Modal from '../../../../internal/Modal';
import { DisputeDetailsCustomization } from '../../../DisputeManagement';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { popoverUtil } from '../../../../internal/Popover/utils/popoverUtil';
import useModalDetails from '../../../../../hooks/useModalDetails';
import { IDisputeStatusGroup } from '../../../../../types/api/models/disputes';
import { DisputeDetailsContainer } from '../../../DisputeManagement/components/DisputeDetailsContainer/DisputeDetailsContainer';
import './DisputeManagementModal.scss';

export interface DisputeManagementModalProps {
    updateDisputesListStatusGroup: (statusGroup?: IDisputeStatusGroup) => void;
    selectedDetail: ReturnType<typeof useModalDetails>['selectedDetail'];
    resetDetails: ReturnType<typeof useModalDetails>['resetDetails'];
    dataCustomization?: { details: DisputeDetailsCustomization };
    onAcceptDispute?: () => void;
    onDefendDispute?: () => void;
}

export const DisputeManagementModal: FC<DisputeManagementModalProps> = ({
    children,
    selectedDetail,
    resetDetails,
    dataCustomization,
    onAcceptDispute,
    onDefendDispute,
    updateDisputesListStatusGroup,
}: PropsWithChildren<DisputeManagementModalProps>) => {
    const { i18n } = useCoreContext();
    const [disputesListStatusGroup, setDisputesListStatusGroup] = useState<IDisputeStatusGroup | undefined>(undefined);
    const isModalOpen = !!selectedDetail;

    useEffect(() => {
        if (isModalOpen) {
            popoverUtil.closeAll();
        }
    }, [isModalOpen]);

    const onAcceptDisputeCallback = useCallback(() => {
        // [TODO]: Uncomment the following line on confirmation that accepted disputes get hoisted to top of the list
        // setDisputesListStatusGroup('ONGOING_AND_CLOSED');
        onAcceptDispute?.();
    }, [onAcceptDispute]);

    const onDefendDisputeCallback = useCallback(() => {
        setDisputesListStatusGroup('ONGOING_AND_CLOSED');
        onDefendDispute?.();
    }, [onDefendDispute]);

    const onCloseCallback = useCallback(() => {
        updateDisputesListStatusGroup(disputesListStatusGroup);
        // After updating the disputes list status group, ensure to reset `disputesListStatusGroup`
        // state value to undefined, to prevent unintended tab navigation from future calls to this
        // onCloseCallback.
        setDisputesListStatusGroup(undefined);
        resetDetails();
    }, [disputesListStatusGroup, updateDisputesListStatusGroup, resetDetails]);

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
                            onAcceptDispute={onAcceptDisputeCallback}
                            onDefendDispute={onDefendDisputeCallback}
                            hideTitle
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};
