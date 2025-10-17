import { useCallback, useEffect, useRef } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import Icon from '../../../../internal/Icon';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { useDisputeFlow } from '../../context/dispute/context';
import { isFunction } from '../../../../../utils';
import { DisputeManagementProps } from '../../types';
import './DefendDisputeFlow.scss';

export const DefendDisputeResponse = ({ onDisputeDefend }: Pick<DisputeManagementProps, 'onDisputeDefend'>) => {
    const { i18n } = useCoreContext();
    const { clearFiles, clearStates, dispute, setFlowState, defendResponse } = useDisputeFlow();

    const goBackToDetails = useCallback(() => {
        clearStates();
        setFlowState('details');
    }, [clearStates, setFlowState]);

    const goBackToFileUploadView = useCallback(() => {
        clearFiles();
        setFlowState('uploadDefenseFilesView');
    }, [clearFiles, setFlowState]);

    const defendCallbackHasBeenCalled = useRef(false);

    useEffect(() => {
        if (defendCallbackHasBeenCalled.current) return;

        if (defendResponse === 'success' && isFunction(onDisputeDefend)) {
            const disputePspReference = dispute?.dispute.pspReference;

            if (disputePspReference) {
                defendCallbackHasBeenCalled.current = true;
                onDisputeDefend({ id: disputePspReference });
            }
        }
    }, [defendResponse, dispute, onDisputeDefend]);

    //TODO: For this view create an internal component
    return (
        <div className={'adyen-pe-defend-dispute__response'}>
            {defendResponse === 'success' ? (
                <div className="adyen-pe-defend-dispute__success">
                    <Icon name="checkmark-circle-fill" className="adyen-pe-defend-dispute__success-icon" />
                    <Typography variant={TypographyVariant.TITLE}>{i18n.get('disputes.management.defend.common.evidenceSubmitted')}</Typography>
                    <Typography variant={TypographyVariant.BODY} className="adyen-pe-defend-dispute__success-description">
                        {i18n.get('disputes.management.defend.chargeback.submitSuccessInfo')}
                    </Typography>
                    <div className="adyen-pe-defend-dispute__success-buttons">
                        <Button variant={ButtonVariant.SECONDARY} onClick={goBackToDetails}>
                            {i18n.get('disputes.management.common.actions.showDetails')}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="adyen-pe-defend-dispute__error">
                    <Icon name="cross-circle-fill" className="adyen-pe-defend-dispute__error-icon" />
                    <Typography variant={TypographyVariant.TITLE} medium>
                        {i18n.get('disputes.management.defend.common.errors.somethingWentWrong')}
                    </Typography>
                    <Typography variant={TypographyVariant.BODY}>{i18n.get('disputes.management.defend.common.errors.defenseFailed')}</Typography>
                    <Button variant={ButtonVariant.SECONDARY} onClick={goBackToFileUploadView}>
                        {i18n.get('disputes.management.common.actions.goBack')}
                    </Button>
                </div>
            )}
        </div>
    );
};
