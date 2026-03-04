import { FunctionalComponent } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import Button from '../../../../internal/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import { IMissingAction, IMissingActionType } from '../../../../../types';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { EMPTY_OBJECT } from '../../../../../utils';
import { useActionsAlertTitles } from '../../hooks';
import { getTopWindowHref, setTopWindowHref } from '../GrantActions/utils';
import { GRANT_ACTION_CONFIGS, sharedCapitalOverviewAnalyticsEventProperties } from '../../constants';
import './GrantActionsHosted.scss';

const CLASSNAMES = {
    button: 'adyen-pe-grant-actions-hosted__button',
    buttonLabel: 'adyen-pe-grant-actions-hosted__button-label',
    actionsContainer: 'adyen-pe-grant-actions-hosted__actions-container',
};

type GrantActionsHostedProps = {
    className?: string;
    expirationDate?: string;
    missingActions: IMissingAction[];
};

export const GrantActionsHosted: FunctionalComponent<GrantActionsHostedProps> = ({ className, expirationDate, missingActions }) => {
    const { i18n, updateCore } = useCoreContext();
    const userEvents = useAnalyticsContext();
    const { anaCreditActionDetails, signToSActionDetails } = useConfigContext().endpoints;

    const [loadingAction, setLoadingAction] = useState<IMissingActionType | null>(null);

    const onRedirect = useCallback((data: { url: string } | undefined) => {
        if (data?.url) {
            setTopWindowHref(data.url);
        } else {
            // If the request was successful but no URL was returned, reset loading state.
            setLoadingAction(null);
        }
    }, []);

    const actionMutation = useMutation({
        queryFn: (actionType: IMissingActionType) => {
            let endpointByAction = null;

            switch (actionType) {
                case 'signToS':
                    endpointByAction = signToSActionDetails;
                    break;
                case 'AnaCredit':
                    endpointByAction = anaCreditActionDetails;
                    break;
                default:
                    break;
            }

            const endpoint = endpointByAction;

            const callbackQuery = {
                query: { redirectUrl: getTopWindowHref(), locale: i18n.locale },
            };

            return endpoint?.(EMPTY_OBJECT, callbackQuery);
        },
        options: {
            onSuccess: onRedirect,
            // Reset the loading state when the mutation finishes (success or error)
            onError: () => {
                setLoadingAction(null);
            },
        },
    });

    const logMissingActionEvent = useCallback(
        (label: string) => {
            userEvents.addEvent?.('Clicked link', {
                ...sharedCapitalOverviewAnalyticsEventProperties,
                subCategory: 'Missing action',
                label,
            });
        },
        [userEvents]
    );

    const renderActionButton = useCallback(
        (actionType: IMissingActionType) => (
            <Button
                className={CLASSNAMES.button}
                onClick={() => {
                    try {
                        setLoadingAction(actionType);
                        void actionMutation.mutate(actionType);
                    } finally {
                        logMissingActionEvent(GRANT_ACTION_CONFIGS[actionType].eventLabel);
                    }
                }}
                variant={ButtonVariant.TERTIARY}
                aria-label={i18n.get(GRANT_ACTION_CONFIGS[actionType].buttonLabelKey)}
                disabled={actionMutation.isLoading}
                state={loadingAction === actionType ? 'loading' : undefined}
            >
                <span className={CLASSNAMES.buttonLabel}>{i18n.get(GRANT_ACTION_CONFIGS[actionType].buttonLabelKey)}</span>
            </Button>
        ),
        [actionMutation, i18n, loadingAction, logMissingActionEvent]
    );

    const alertTitles = useActionsAlertTitles(expirationDate);
    const alertConfig = useMemo(() => {
        if (missingActions.length > 1) {
            return {
                title: alertTitles.multiple,
                description: (
                    <ol className={CLASSNAMES.actionsContainer}>
                        {missingActions.map(action => (
                            <li key={action.type}>{renderActionButton(action.type)}</li>
                        ))}
                    </ol>
                ),
            };
        } else {
            const actionType = missingActions[0]!.type;
            return {
                title: alertTitles.single,
                description: renderActionButton(actionType),
            };
        }
    }, [alertTitles.multiple, alertTitles.single, missingActions, renderActionButton]);

    if (actionMutation.error) {
        return (
            <Alert
                className={className}
                type={AlertTypeOption.CRITICAL}
                title={i18n.get('capital.overview.grants.item.alerts.somethingWentWrong')}
                description={
                    <Button className={CLASSNAMES.button} onClick={updateCore}>
                        {i18n.get('common.actions.refresh.labels.default')}
                    </Button>
                }
            />
        );
    }

    return <Alert className={className} type={AlertTypeOption.WARNING} title={alertConfig.title} description={alertConfig.description} />;
};
