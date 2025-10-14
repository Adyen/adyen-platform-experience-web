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

export const DefendDisputeFlow = ({ onDisputeDefend }: Pick<DisputeManagementProps, 'onDisputeDefend'>) => {
    const { i18n } = useCoreContext();
    const { applicableDocuments, flowState } = useDisputeFlow();
    const { withinModal } = useModalContext();

    const titleEl = withinModal ? TypographyElement.H2 : TypographyElement.DIV;

    return (
        <div className="adyen-pe-defend-dispute__container">
            {flowState !== 'defenseSubmitResponseView' && (
                <Typography className={'adyen-pe-defend-dispute__title'} el={titleEl} variant={TypographyVariant.TITLE} medium>
                    {i18n.get('disputes.management.defend.chargeback.title')}
                </Typography>
            )}
            {flowState === 'defendReasonSelectionView' && <DefendDisputeReason />}
            {flowState === 'uploadDefenseFilesView' && !!applicableDocuments?.length && <DefendDisputeFileUpload />}
            {flowState === 'defenseSubmitResponseView' && <DefendDisputeResponse onDisputeDefend={onDisputeDefend} />}
        </div>
    );
};
