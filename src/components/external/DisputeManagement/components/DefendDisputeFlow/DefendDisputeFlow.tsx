import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { useDisputeFlow } from '../../context/dispute/context';
import { DefendDisputeFileUpload } from './DefendDisputeFileUpload';
import { DefendDisputeReason } from './DefendDisputeReason';
import './DefendDisputeFlow.scss';

export const DefendDisputeFlow = () => {
    const { i18n } = useCoreContext();
    const { applicableDocuments, flowState } = useDisputeFlow();

    return (
        <div className="adyen-pe-defend-dispute__container">
            <Typography className="adyen-pe-defend-dispute__title" variant={TypographyVariant.BODY} medium>
                {i18n.get('dispute.defendDisputeTitle')}
            </Typography>
            {flowState === 'defendReasonSelectionView' && <DefendDisputeReason />}
            {flowState === 'uploadDefenseFilesView' && !!applicableDocuments?.length && <DefendDisputeFileUpload />}
        </div>
    );
};
