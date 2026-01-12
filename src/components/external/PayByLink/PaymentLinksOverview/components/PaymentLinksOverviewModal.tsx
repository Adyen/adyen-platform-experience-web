import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { popoverUtil } from '../../../../internal/Popover/utils/popoverUtil';
import Modal from '../../../../internal/Modal';
import { PaymentLinksOverviewModalType } from './types';
import PaymentLinkCreationContainer from '../../PaymentLinkCreation/components/PaymentLinkCreationContainer/PaymentLinkCreationContainer';
import PaymentLinkSettingsContainer from '../../PaymentLinkSettings/components/PaymentLinkSettingsContainer/PaymentLinkSettingsContainer';
import { PaymentLinksOverviewComponentProps } from '../../../../types';
import { StoreIds } from '../types';
import { PaymentLinkCreationFormValues } from '../../PaymentLinkCreation/components/types';

export interface PaymentLinksOverviewModalProps {
    isModalVisible: boolean;
    onCloseModal: () => void;
    onContactSupport?: () => void;
    modalType?: PaymentLinksOverviewModalType;
    paymentLinkCreation: PaymentLinksOverviewComponentProps['paymentLinkCreation'];
    paymentLinkSettings: PaymentLinksOverviewComponentProps['paymentLinkSettings'];
    storeIds?: StoreIds;
    refreshPaymentLinkList?: () => void;
}

export const PaymentLinksOverviewModal = ({
    isModalVisible,
    onCloseModal,
    modalType,
    paymentLinkCreation,
    paymentLinkSettings,
    storeIds,
    onContactSupport,
    refreshPaymentLinkList,
}: PaymentLinksOverviewModalProps) => {
    const { i18n } = useCoreContext();
    const [hasToRefresh, setHasToRefresh] = useState(false);

    const onCloseCallback = useCallback(() => {
        onCloseModal();
        if (hasToRefresh) {
            refreshPaymentLinkList?.();
            setHasToRefresh(false);
        }
    }, [onCloseModal, hasToRefresh, refreshPaymentLinkList]);

    useEffect(() => {
        if (isModalVisible) {
            popoverUtil.closeAll();
        }
    }, [isModalVisible]);

    const onPaymentLinkCreated = useCallback(
        (paymentLink: PaymentLinkCreationFormValues) => {
            paymentLinkCreation?.onPaymentLinkCreated?.(paymentLink);
            setHasToRefresh(true);
        },
        [paymentLinkCreation]
    );

    if (!isModalVisible || !modalType) return null;

    return (
        <div>
            <Modal
                isOpen={isModalVisible}
                aria-label={i18n.get('payByLink.overview.title')}
                onClose={onCloseCallback}
                isDismissible={true}
                headerWithBorder={false}
                size={'large'}
            >
                {modalType === 'Creation' ? (
                    <PaymentLinkCreationContainer
                        {...paymentLinkCreation}
                        onPaymentLinkCreated={onPaymentLinkCreated}
                        storeIds={storeIds}
                        onContactSupport={onContactSupport}
                        embeddedInOverview
                    />
                ) : null}
                {modalType === 'Settings' ? (
                    <PaymentLinkSettingsContainer
                        {...paymentLinkSettings}
                        storeIds={storeIds}
                        onContactSupport={onContactSupport}
                        embeddedInOverview
                    />
                ) : null}
            </Modal>
        </div>
    );
};
