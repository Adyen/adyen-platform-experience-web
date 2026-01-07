import { useCallback, useState } from 'preact/hooks';
import { FC, PropsWithChildren } from 'preact/compat';
import Modal from '../../../../internal/Modal';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useModalDetails from '../../../../../hooks/useModalDetails';
import { PaymentLinkDetails } from '../../../PaymentLinkDetails/components/PaymentLinkDetails/PaymentLinkDetails';

export interface PaymentLinkDetailsModalProps {
    onUpdate: () => void;
    selectedDetail: ReturnType<typeof useModalDetails>['selectedDetail'];
    resetDetails: ReturnType<typeof useModalDetails>['resetDetails'];
}

export const PaymentLinkDetailsModal: FC<PaymentLinkDetailsModalProps> = ({
    children,
    selectedDetail,
    resetDetails,
    onUpdate,
}: PropsWithChildren<PaymentLinkDetailsModalProps>) => {
    const { i18n } = useCoreContext();
    const [isPaymentLinkUpdated, setIsPaymentLinkUpdated] = useState(false);
    const isModalOpen = !!selectedDetail;

    const handleDismiss = useCallback(
        (withUpdate = false) => {
            if (isPaymentLinkUpdated || withUpdate) {
                setIsPaymentLinkUpdated(false);
                onUpdate();
            }
            resetDetails();
        },
        [isPaymentLinkUpdated, setIsPaymentLinkUpdated, onUpdate, resetDetails]
    );

    const handlePaymentLinkUpdate = useCallback(() => {
        setIsPaymentLinkUpdated(true);
    }, []);

    return (
        <div>
            {children}
            {selectedDetail && (
                <Modal
                    isOpen={isModalOpen}
                    aria-label={i18n.get('payByLink.details.title')}
                    onClose={handleDismiss}
                    isDismissible={true}
                    headerWithBorder={false}
                    size={selectedDetail.modalSize || 'large'}
                >
                    <PaymentLinkDetails id={selectedDetail.selection.data} onUpdate={handlePaymentLinkUpdate} onDismiss={handleDismiss} hideTitle />
                </Modal>
            )}
        </div>
    );
};
