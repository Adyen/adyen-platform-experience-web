import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useModalContext } from '../../../../internal/Modal/Modal';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { useDisputeFlow } from '../../context/dispute/context';
import { DefendDisputeFileUpload } from './DefendDisputeFileUpload';
import { DefendDisputeReason } from './DefendDisputeReason';
import { DefendDisputeResponse } from './DefendDisputeResponse';
import { DisputeManagementProps } from '../../types';
import './DefendDisputeFlow.scss';
import { useMemo } from 'preact/hooks';

export const DefendDisputeFlow = ({ onDisputeDefend }: Pick<DisputeManagementProps, 'onDisputeDefend'>) => {
    const { i18n } = useCoreContext();
    const { applicableDocuments, flowState, dispute } = useDisputeFlow();
    const { withinModal } = useModalContext();

    const titleEl = withinModal ? TypographyElement.H2 : TypographyElement.DIV;

    const defendDisputeTitle = useMemo(
        () =>
            dispute?.dispute.type === 'REQUEST_FOR_INFORMATION'
                ? i18n.get('disputes.management.defend.requestForInformation.title')
                : i18n.get('disputes.management.defend.chargeback.title'),
        [dispute?.dispute.type, i18n]
    );

    return (
        <div className="adyen-pe-defend-dispute__container">
            {flowState !== 'defenseSubmitResponseView' && (
                <Typography className={'adyen-pe-defend-dispute__title'} el={titleEl} variant={TypographyVariant.TITLE} medium>
                    {defendDisputeTitle}
                </Typography>
            )}
            {flowState === 'defendReasonSelectionView' && <DefendDisputeReason />}
            {flowState === 'uploadDefenseFilesView' && !!applicableDocuments?.length && <DefendDisputeFileUpload />}
            {flowState === 'defenseSubmitResponseView' && <DefendDisputeResponse onDisputeDefend={onDisputeDefend} />}
        </div>
    );
};
