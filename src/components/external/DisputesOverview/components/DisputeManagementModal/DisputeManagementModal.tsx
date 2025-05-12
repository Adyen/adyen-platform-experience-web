import { useCallback, useEffect } from 'preact/hooks';
import { FC, PropsWithChildren } from 'preact/compat';
import Modal from '../../../../internal/Modal';
import { DisputeDetailsCustomization } from '../../../DisputeManagement';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { popoverUtil } from '../../../../internal/Popover/utils/popoverUtil';
import useModalDetails from '../../../../../hooks/useModalDetails';
import { DisputeDetails } from '../../../DisputeManagement/components/DisputeDetails/DisputeDetails';
import './DisputeManagementModal.scss';

export interface DisputeManagementModalProps {
    selectedDetail: ReturnType<typeof useModalDetails>['selectedDetail'];
    resetDetails: ReturnType<typeof useModalDetails>['resetDetails'];
    dataCustomization?: { details: DisputeDetailsCustomization };
    onAcceptDispute?: () => void;
    onContactSupport?: () => void;
}

export const DisputeManagementModal: FC<DisputeManagementModalProps> = ({
    children,
    selectedDetail,
    resetDetails,
    dataCustomization,
    onAcceptDispute,
    onContactSupport,
}: PropsWithChildren<DisputeManagementModalProps>) => {
    const { i18n } = useCoreContext();
    const isModalOpen = !!selectedDetail;

    useEffect(() => {
        if (isModalOpen) {
            popoverUtil.closeAll();
        }
    }, [isModalOpen]);

    const onAcceptDisputeCallback = useCallback(() => {
        onAcceptDispute?.();
    }, [onAcceptDispute]);

    return (
        <div>
            {children}
            {selectedDetail && (
                <Modal
                    isOpen={!!selectedDetail}
                    aria-label={i18n.get('disputes.disputeManagementTitle')}
                    onClose={resetDetails}
                    isDismissible={true}
                    headerWithBorder={false}
                    size={selectedDetail.modalSize || 'large'}
                >
                    <div className="adyen-pe-dispute-management-modal-content">
                        <DisputeDetails
                            id={selectedDetail.selection.data}
                            dataCustomization={dataCustomization}
                            onAcceptDispute={onAcceptDisputeCallback}
                            onContactSupport={onContactSupport}
                            onDetailsDismiss={resetDetails}
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};
