import useCoreContext from '../../../../core/Context/useCoreContext';
import { useCallback, useEffect } from 'preact/hooks';
import { popoverUtil } from '../../../internal/Popover/utils/popoverUtil';
import Modal from '../../../internal/Modal';
import { PayByLinkOverviewModalType } from './types';
import PayByLinkCreationContainer from '../../PayByLink/PayByLinkCreation/components/PayByLinkCreationContainer/PayByLinkCreationContainer';
import PayByLinkSettingsContainer from '../../PayByLink/PayByLinkSettings/components/PayByLinkSettingsContainer/PayByLinkSettingsContainer';
import { PayByLinkOverviewComponentProps } from '../../../types';
import { StoreIds } from '../../PayByLink/types';

export interface PayByLinkOverviewModalProps {
    isModalVisible: boolean;
    onCloseModal: () => void;
    onContactSupport?: () => void;
    modalType?: PayByLinkOverviewModalType;
    paymentLinkCreation: PayByLinkOverviewComponentProps['paymentLinkCreation'];
    paymentLinkSettings: PayByLinkOverviewComponentProps['paymentLinkSettings'];
    storeIds?: StoreIds;
}

export const PayByLinkOverviewModal = ({
    isModalVisible,
    onCloseModal,
    modalType,
    paymentLinkCreation,
    paymentLinkSettings,
    storeIds,
    onContactSupport,
}: PayByLinkOverviewModalProps) => {
    const { i18n } = useCoreContext();

    const onCloseCallback = useCallback(() => {
        onCloseModal();
    }, [onCloseModal]);

    useEffect(() => {
        if (isModalVisible) {
            popoverUtil.closeAll();
        }
    }, [isModalVisible]);

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
                {modalType === 'LinkCreation' ? (
                    <PayByLinkCreationContainer {...paymentLinkCreation} storeIds={storeIds} onContactSupport={onContactSupport} />
                ) : null}
                {modalType === 'Settings' ? (
                    <PayByLinkSettingsContainer {...paymentLinkSettings} storeIds={storeIds} onContactSupport={onContactSupport} embeddedInOverview />
                ) : null}
            </Modal>
        </div>
    );
};
