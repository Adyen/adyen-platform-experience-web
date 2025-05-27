import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { useDisputeFlow } from '../../context/dispute/context';
import { DefendDisputeFileUpload } from './DefendDisputeFileUpload';
import { DefendDisputeReason } from './DefendDisputeReason';
import './DefendDisputeFlow.scss';
import { DefendDisputeResponse } from './DefendDisputeResponse';

export const DefendDisputeFlow = ({ onDefendDispute }: { onDefendDispute?: () => void }) => {
    const { i18n } = useCoreContext();
    const { applicableDocuments, flowState } = useDisputeFlow();

    return (
        <div className="adyen-pe-defend-dispute__container">
            {flowState !== 'defenseSubmitResponseView' && (
                <Typography variant={TypographyVariant.TITLE} medium>
                    {i18n.get('disputes.defend.chargeback')}
                </Typography>
            )}
            {flowState === 'defendReasonSelectionView' && <DefendDisputeReason />}
            {flowState === 'uploadDefenseFilesView' && !!applicableDocuments?.length && <DefendDisputeFileUpload />}
            {flowState === 'defenseSubmitResponseView' && <DefendDisputeResponse onDefendDispute={onDefendDispute} />}
        </div>
    );
};
