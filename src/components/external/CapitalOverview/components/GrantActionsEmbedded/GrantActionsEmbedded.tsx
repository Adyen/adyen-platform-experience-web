import { Fragment, FunctionalComponent } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import Button from '../../../../internal/Button';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { ButtonVariant } from '../../../../internal/Button/types';
import { IMissingAction, IMissingActionType } from '../../../../../types';
import { GRANT_ACTION_CONFIGS, sharedCapitalOverviewAnalyticsEventProperties } from '../../constants';
import Modal from '../../../../internal/Modal';
import { EMPTY_OBJECT } from '../../../../../utils';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import { useActionsAlertTitles } from '../../hooks';
import Icon from '../../../../internal/Icon';
import './GrantActionsEmbedded.scss';

const CLASSNAMES = {
    actionButtonsContainer: 'adyen-pe-grant-actions-embedded__action-buttons-container',
    actionButton: 'adyen-pe-grant-actions-embedded__action-button',
};

const ANALYTICS_EVENT_DELAY_MS = 50;

const sharedActionAnalyticsEventProps = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    category: 'Missing action modal',
};

type GrantActionsEmbeddedProps = {
    className?: string;
    legalEntityId: string;
    missingActions: IMissingAction[];
    expirationDate?: string;
    onComplete: () => void;
};

export const GrantActionsEmbedded: FunctionalComponent<GrantActionsEmbeddedProps> = ({
    className,
    expirationDate,
    legalEntityId,
    missingActions,
    onComplete,
}) => {
    const { i18n, environment } = useCoreContext();
    const userEvents = useAnalyticsContext();
    const { getOnboardingConfiguration } = useConfigContext().endpoints;
    const completedActionsRef = useRef<Set<IMissingActionType>>(new Set());
    const timeoutIdsRef = useRef<Map<IMissingActionType, ReturnType<typeof setTimeout>>>(new Map());

    const fetchToken = useCallback(async () => {
        const data = await getOnboardingConfiguration?.(EMPTY_OBJECT);
        return { token: data?.token || '' };
    }, [getOnboardingConfiguration]);

    const [actionsWithLoadedComponent, setActionsWithLoadedComponent] = useState<IMissingActionType[]>([]);
    const [activeAction, setActiveAction] = useState<IMissingActionType | undefined>(undefined);
    const [completedActions, setCompletedActions] = useState<IMissingActionType[]>([]);
    const areActionsCompleted = useMemo(() => completedActions.length === missingActions.length, [completedActions.length, missingActions.length]);

    useEffect(() => {
        if (areActionsCompleted) {
            onComplete();
        }
    }, [areActionsCompleted, onComplete]);

    useEffect(() => {
        const timeoutIds = timeoutIdsRef.current;
        return () => {
            timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
            timeoutIds.clear();
        };
    }, []);

    const loadKYCComponent = useCallback(
        async (actionType: IMissingActionType) => {
            if (!actionsWithLoadedComponent.includes(actionType)) {
                switch (actionType) {
                    case 'AnaCredit':
                        await import('@adyen/kyc-components/business-financing');
                        break;
                    case 'signToS':
                        await import('@adyen/kyc-components/terms-of-service-management');
                        break;
                }

                setActionsWithLoadedComponent(prev => [...prev, actionType]);
            }
        },
        [actionsWithLoadedComponent]
    );

    const handleActionButtonClick = useCallback(
        async (actionType: IMissingActionType) => {
            await loadKYCComponent(actionType);
            setActiveAction(actionType);
            userEvents.addEvent?.('Clicked button', {
                ...sharedCapitalOverviewAnalyticsEventProperties,
                subCategory: 'Missing action',
                label: GRANT_ACTION_CONFIGS[actionType].eventLabel,
            });
        },
        [loadKYCComponent, userEvents]
    );

    const getActionButtonVariant = useCallback(
        (actionType: IMissingActionType) => {
            const primaryAction = missingActions.find(action => !completedActions.includes(action.type));
            return primaryAction?.type === actionType ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY;
        },
        [completedActions, missingActions]
    );

    const renderActionButton = useCallback(
        (actionType: IMissingActionType) => {
            const isActionCompleted = completedActions.includes(actionType);
            const config = GRANT_ACTION_CONFIGS[actionType];
            return (
                <Button
                    className={CLASSNAMES.actionButton}
                    onClick={() => handleActionButtonClick(actionType)}
                    variant={getActionButtonVariant(actionType)}
                    aria-label={i18n.get(config.buttonLabelKey)}
                    iconLeft={isActionCompleted ? <Icon name="checkmark-circle-fill" /> : undefined}
                >
                    {isActionCompleted ? i18n.get(config.successButtonLabelKey) : i18n.get(config.buttonLabelKey)}
                </Button>
            );
        },
        [completedActions, getActionButtonVariant, handleActionButtonClick, i18n]
    );

    const alertTitles = useActionsAlertTitles(expirationDate);
    const processAlertTitle = useCallback(
        (title: string) => (areActionsCompleted ? i18n.get('capital.overview.grants.item.alerts.actionsCompleted') : title),
        [areActionsCompleted, i18n]
    );
    const alertConfig = useMemo(() => {
        if (missingActions.length > 1) {
            return {
                title: processAlertTitle(alertTitles.multiple),
                description: (
                    <div className={CLASSNAMES.actionButtonsContainer}>
                        {missingActions.map(action => (
                            <Fragment key={action.type}>{renderActionButton(action.type)}</Fragment>
                        ))}
                    </div>
                ),
            };
        } else {
            const actionType = missingActions[0]!.type;
            return {
                title: processAlertTitle(alertTitles.single),
                description: renderActionButton(actionType),
            };
        }
    }, [alertTitles.multiple, alertTitles.single, missingActions, processAlertTitle, renderActionButton]);

    const close = useCallback(() => {
        setActiveAction(undefined);
    }, []);

    const completeAction = useCallback(() => {
        if (activeAction) {
            setCompletedActions(prev => (prev.includes(activeAction) ? prev : [...prev, activeAction]));
        }
        close();
    }, [activeAction, close]);

    const handleClose = useCallback(
        (actionType: IMissingActionType, analyticsProps: { subCategory: string; label: string }) => {
            close();
            const existingTimeout = timeoutIdsRef.current.get(actionType);
            if (existingTimeout !== undefined) {
                clearTimeout(existingTimeout);
            }
            const timeoutId = setTimeout(() => {
                if (!completedActionsRef.current.has(actionType)) {
                    userEvents.addEvent?.('Clicked button', {
                        ...sharedActionAnalyticsEventProps,
                        ...analyticsProps,
                    });
                }
                completedActionsRef.current.delete(actionType);
                timeoutIdsRef.current.delete(actionType);
            }, ANALYTICS_EVENT_DELAY_MS);
            timeoutIdsRef.current.set(actionType, timeoutId);
        },
        [close, userEvents]
    );

    const handleBusinessFinancingClose = useCallback(() => {
        handleClose('AnaCredit', {
            subCategory: 'Information',
            label: 'Dismissed AnaCredit information',
        });
    }, [handleClose]);

    const handleBusinessFinancingComplete = useCallback(() => {
        completedActionsRef.current.add('AnaCredit');
        completeAction();
        userEvents.addEvent?.('Clicked button', {
            ...sharedActionAnalyticsEventProps,
            subCategory: 'Information',
            label: 'Submitted AnaCredit information',
        });
    }, [completeAction, userEvents]);

    const handleTermsOfServiceClose = useCallback(() => {
        handleClose('signToS', {
            subCategory: 'Terms & conditions',
            label: 'Dismissed terms & conditions',
        });
    }, [handleClose]);

    const handleTermsOfServiceAccept = useCallback(() => {
        userEvents.addEvent?.('Clicked button', {
            ...sharedActionAnalyticsEventProps,
            subCategory: 'Terms & conditions',
            label: 'Signed terms & conditions',
        });
    }, [userEvents]);

    const handleTermsOfServiceComplete = useCallback(() => {
        completedActionsRef.current.add('signToS');
        completeAction();
        userEvents.addEvent?.('Clicked button', {
            ...sharedActionAnalyticsEventProps,
            subCategory: 'Terms & conditions',
            label: 'Finished terms & conditions',
        });
    }, [completeAction, userEvents]);

    return (
        <div>
            <Alert
                className={className}
                type={areActionsCompleted ? AlertTypeOption.HIGHLIGHT : AlertTypeOption.WARNING}
                title={alertConfig.title}
                description={alertConfig.description}
            />
            <Modal isOpen={!!activeAction} onClose={close} isDismissible={false} headerWithBorder={false} size="large">
                {activeAction === 'AnaCredit' && (
                    <adyen-business-financing
                        locale={i18n.locale}
                        environment={environment}
                        fetchToken={fetchToken}
                        rootlegalentityid={legalEntityId}
                        oncomplete={handleBusinessFinancingComplete}
                        onclose={handleBusinessFinancingClose}
                    ></adyen-business-financing>
                )}

                {activeAction === 'signToS' && (
                    <adyen-terms-of-service-management
                        locale={i18n.locale}
                        environment={environment}
                        fetchToken={fetchToken}
                        rootlegalentityid={legalEntityId}
                        onaccept={handleTermsOfServiceAccept}
                        oncomplete={handleTermsOfServiceComplete}
                        onclose={handleTermsOfServiceClose}
                    ></adyen-terms-of-service-management>
                )}
            </Modal>
        </div>
    );
};
