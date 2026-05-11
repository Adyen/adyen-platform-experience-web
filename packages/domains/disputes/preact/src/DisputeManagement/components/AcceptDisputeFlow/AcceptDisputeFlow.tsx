import Typography from '@integration-components/ui-primitives-preact/Typography/Typography';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-primitives-preact/Typography/types';
import { useModalContext } from '@integration-components/ui-primitives-preact/Modal/Modal';
import { useCoreContext, useConfigContext } from '@integration-components/core/preact';
import ButtonActions from '@integration-components/ui-primitives-preact/Button/ButtonActions/ButtonActions';
import { ButtonActionsList } from '@integration-components/ui-primitives-preact/Button/ButtonActions/types';
import { ButtonVariant } from '@integration-components/ui-primitives-preact/Button/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useDisputeFlow } from '../../context/dispute/context';
import useMutation from '@integration-components/hooks-preact/useMutation/useMutation';
import { EMPTY_OBJECT, isFunction, uniqueId } from '@integration-components/utils';
import { TranslationKey } from '@integration-components/core';
import { DisputeManagementProps } from '../../types';
import Button from '@integration-components/ui-primitives-preact/Button';
import Icon from '@integration-components/ui-primitives-preact/Icon';
import SuccessIcon from '@integration-components/ui-primitives-preact/SuccessIcon/SuccessIcon';
import './AcceptDisputeFlow.scss';

export const AcceptDisputeFlow = ({ onDisputeAccept }: Pick<DisputeManagementProps, 'onDisputeAccept'>) => {
    const { i18n } = useCoreContext();
    const { acceptDispute } = useConfigContext().endpoints;
    const { dispute, clearStates, goBack } = useDisputeFlow();
    const { withinModal } = useModalContext();

    const cachedDispute = useRef(dispute).current ?? dispute;
    const titleEl = withinModal ? TypographyElement.H2 : TypographyElement.DIV;

    const disputePspReference = cachedDispute?.dispute.pspReference;
    const disputeType = cachedDispute?.dispute.type;
    const isRequestForInformation = disputeType === 'REQUEST_FOR_INFORMATION';

    const acceptedLabel = useRef<TranslationKey>('disputes.management.accept.chargeback.accepted');
    const acceptDisclaimer = useRef<TranslationKey>('disputes.management.accept.chargeback.disclaimer');
    const acceptTitle = useRef<TranslationKey>('disputes.management.accept.chargeback.title');
    const acceptButtonTitle = useRef<TranslationKey>('disputes.management.accept.chargeback.actions.accept');
    const isRFI = useRef(isRequestForInformation);

    if ((isRFI.current ||= isRequestForInformation)) {
        acceptedLabel.current = 'disputes.management.accept.requestForInformation.accepted';
        acceptDisclaimer.current = 'disputes.management.accept.requestForInformation.disclaimer';
        acceptTitle.current = 'disputes.management.accept.requestForInformation.title';
        acceptButtonTitle.current = 'disputes.management.accept.requestForInformation.actions.accept';
    }

    const [termsAgreed, setTermsAgreed] = useState(false);
    const [disputeAccepted, setDisputeAccepted] = useState(false);

    const acceptDisputeMutation = useMutation({
        queryFn: acceptDispute,
        options: {
            onSuccess: useCallback(() => {
                clearStates();
                setDisputeAccepted(true);
            }, [clearStates]),
        },
    });

    const interactionsDisabled = acceptDisputeMutation.isLoading || disputeAccepted;
    const canAcceptDispute = termsAgreed && !interactionsDisabled;

    const acceptDisputeCallback = useCallback(() => {
        if (!canAcceptDispute) return;
        void acceptDisputeMutation.mutate(EMPTY_OBJECT, { path: { disputePspReference: disputePspReference! } });
    }, [canAcceptDispute, disputePspReference, acceptDisputeMutation]);

    const toggleTermsAgreement = useCallback(() => {
        if (interactionsDisabled) return;
        setTermsAgreed(prev => !prev);
    }, [interactionsDisabled]);

    const actionButtons = useMemo<ButtonActionsList>(() => {
        return [
            {
                title: i18n.get(acceptButtonTitle.current),
                disabled: !canAcceptDispute,
                state: acceptDisputeMutation.isLoading ? 'loading' : 'default',
                variant: ButtonVariant.PRIMARY,
                event: acceptDisputeCallback,
                classNames: disputeAccepted ? ['adyen-pe-accept-dispute__accepted-btn'] : undefined,
                renderTitle: title => {
                    if (disputeAccepted) {
                        return (
                            <>
                                <Icon name="checkmark-circle-fill" className="adyen-pe-accept-dispute__accepted-icon" />
                                {i18n.get('disputes.management.accept.common.accepted')}
                            </>
                        );
                    }
                    return title;
                },
            },
            {
                title: i18n.get('disputes.management.common.actions.goBack'),
                disabled: acceptDisputeMutation.isLoading,
                variant: ButtonVariant.SECONDARY,
                event: goBack,
            },
        ];
    }, [i18n, acceptDisputeCallback, acceptDisputeMutation.isLoading, canAcceptDispute, goBack, disputeAccepted]);

    const acceptCallbackHasBeenCalled = useRef(false);
    const termsAgreementInputId = useRef(uniqueId()).current;

    useEffect(() => {
        if (acceptCallbackHasBeenCalled.current) return;

        if (disputeAccepted && disputePspReference && isFunction(onDisputeAccept)) {
            acceptCallbackHasBeenCalled.current = true;
            onDisputeAccept({ id: disputePspReference });
        }
    }, [disputeAccepted, disputePspReference, onDisputeAccept]);

    return (
        <div className="adyen-pe-accept-dispute__container">
            {disputeAccepted ? (
                <div className="adyen-pe-accept-dispute__success">
                    <SuccessIcon className="adyen-pe-accept-dispute__success-icon" />
                    <Typography variant={TypographyVariant.TITLE}>{i18n.get(acceptedLabel.current)}</Typography>
                    <Button variant={ButtonVariant.SECONDARY} onClick={goBack}>
                        {i18n.get('disputes.management.common.actions.showDetails')}
                    </Button>
                </div>
            ) : (
                <>
                    <Typography className="adyen-pe-accept-dispute__title" el={titleEl} variant={TypographyVariant.TITLE} medium>
                        {i18n.get(acceptTitle.current)}
                    </Typography>
                    <Typography variant={TypographyVariant.BODY} medium>
                        {i18n.get(acceptDisclaimer.current)}
                    </Typography>
                    <div className="adyen-pe-accept-dispute__input">
                        <input
                            type="checkbox"
                            disabled={interactionsDisabled}
                            className="adyen-pe-visually-hidden"
                            id={termsAgreementInputId}
                            onInput={toggleTermsAgreement}
                        />

                        <label className="adyen-pe-accept-dispute__label" htmlFor={termsAgreementInputId}>
                            {termsAgreed ? <Icon name="checkmark-square-fill" /> : <Icon name="square" />}
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                {i18n.get('disputes.management.accept.common.agree')}
                            </Typography>
                        </label>
                    </div>

                    <div className="adyen-pe-accept-dispute__actions">
                        <ButtonActions actions={actionButtons} />
                    </div>
                </>
            )}
        </div>
    );
};
