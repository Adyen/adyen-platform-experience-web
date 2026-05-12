import { useEffect } from 'preact/hooks';
import { FC, PropsWithChildren } from 'preact/compat';
import { useCoreContext } from '@integration-components/core/preact';
import type { DataCustomizationObject } from '@integration-components/types';
import type { TranslationKey } from '@integration-components/core';
import useModalDetails from '@integration-components/hooks-preact/useModalDetails';
import Modal from '@integration-components/ui-components-preact/Modal';
import { popoverUtil } from '@integration-components/ui-components-preact/Popover/utils/popoverUtil';
import ModalContent from '../Modal/ModalContent/ModalContent';

export interface DataOverviewDisplayProps {
    ariaLabelKey: TranslationKey;
    onContactSupport?: () => void;
    balanceAccountDescription?: string;
    selectedDetail: ReturnType<typeof useModalDetails>['selectedDetail'];
    resetDetails: ReturnType<typeof useModalDetails>['resetDetails'];
    className: string;
    dataCustomization?: DataCustomizationObject<any, any, any>;
}

export const DataDetailsModal: FC<DataOverviewDisplayProps> = ({
    children,
    className,
    ariaLabelKey,
    selectedDetail,
    resetDetails,
    dataCustomization,
}: PropsWithChildren<DataOverviewDisplayProps>) => {
    const { i18n } = useCoreContext();
    const isModalOpen = !!selectedDetail;

    useEffect(() => {
        if (isModalOpen) {
            popoverUtil.closeAll();
        }
    }, [isModalOpen]);

    return (
        <div className={className}>
            {children}
            {selectedDetail && (
                <Modal
                    title={selectedDetail?.title ? i18n.get(selectedDetail.title) : undefined}
                    isOpen={!!selectedDetail}
                    aria-label={i18n.get(ariaLabelKey)}
                    onClose={resetDetails}
                    isDismissible={true}
                    headerWithBorder={false}
                    size={selectedDetail?.modalSize ?? 'large'}
                >
                    {selectedDetail && <ModalContent dataCustomization={{ details: dataCustomization }} {...selectedDetail?.selection} />}
                </Modal>
            )}
        </div>
    );
};
