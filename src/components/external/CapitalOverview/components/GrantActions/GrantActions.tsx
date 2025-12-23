import { FunctionalComponent } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import { DATE_FORMAT_MISSING_ACTION } from '../../../../../constants';
import { GRANT_ACTION_CLASS_NAMES } from './constants';
import './GrantActions.scss';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import Button from '../../../../internal/Button';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../utils';
import { getTopWindowHref, setTopWindowHref } from './utils';
import { ButtonVariant } from '../../../../internal/Button/types';
import { IGrant } from '../../../../../types';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';

type ActionType = NonNullable<IGrant['missingActions']>[number]['type'];

export const GrantActions: FunctionalComponent<{ missingActions: IGrant['missingActions']; offerExpiresAt?: string; className?: string }> = ({
    missingActions = [],
    offerExpiresAt,
    className,
}) => {
    const { i18n, updateCore } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const { endpoints } = useConfigContext();

    const ACTION_CONFIG = useMemo(
        () =>
            ({
                signToS: {
                    getTitle: (formattedDate: string | undefined) =>
                        formattedDate
                            ? i18n.get('capital.overview.grants.item.alerts.signTermsAndConditionsBy', {
                                  values: { date: formattedDate },
                              })
                            : i18n.get('capital.overview.grants.item.alerts.signTermsAndConditions'),
                    buttonLabelKey: 'capital.overview.grants.item.actions.viewTermsAndConditions',
                },
                AnaCredit: {
                    getTitle: (formattedDate: string | undefined) =>
                        formattedDate
                            ? i18n.get('capital.overview.grants.item.alerts.actionNeededBy', {
                                  values: { date: formattedDate },
                              })
                            : i18n.get('capital.overview.grants.item.alerts.actionNeeded'),
                    buttonLabelKey: 'capital.overview.grants.item.actions.submitInformation',
                },
            }) as const,
        [i18n]
    );

    // Use local state to track which action is loading
    const [loadingAction, setLoadingAction] = useState<ActionType | null>(null);

    const onRedirect = useCallback((data: { url: string } | undefined) => {
        if (data?.url) {
            setTopWindowHref(data.url);
        } else {
            // If the request was successful but no URL was returned, reset loading state.
            setLoadingAction(null);
        }
    }, []);

    const actionMutation = useMutation({
        queryFn: (actionType: ActionType) => {
            let endpointByAction = null;

            switch (actionType) {
                case 'signToS':
                    endpointByAction = endpoints.signToSActionDetails;
                    break;
                case 'AnaCredit':
                    endpointByAction = endpoints.anaCreditActionDetails;
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

    const formattedExpiryDate = useMemo(
        () => (offerExpiresAt ? dateFormat(offerExpiresAt, DATE_FORMAT_MISSING_ACTION) : undefined),
        [dateFormat, offerExpiresAt]
    );

    if (actionMutation.error) {
        return (
            <Alert
                className={className}
                type={AlertTypeOption.CRITICAL}
                title={i18n.get('capital.overview.grants.item.alerts.somethingWentWrong')}
                description={
                    <Button className={GRANT_ACTION_CLASS_NAMES.button} onClick={updateCore}>
                        {i18n.get('common.actions.refresh.labels.default')}
                    </Button>
                }
            />
        );
    }

    if (!missingActions.length) {
        return null;
    }

    if (missingActions.length > 1) {
        return (
            <Alert
                className={className}
                type={AlertTypeOption.WARNING}
                title={i18n.get('capital.overview.grants.item.alerts.actionNeededMany')}
                description={
                    <div className={GRANT_ACTION_CLASS_NAMES.actionsInformation}>
                        <ol className={GRANT_ACTION_CLASS_NAMES.actionsContainer}>
                            {missingActions.map(action => {
                                const config = ACTION_CONFIG[action.type];
                                const isLoading = loadingAction === action.type;
                                return (
                                    <li key={action.type}>
                                        <Button
                                            className={GRANT_ACTION_CLASS_NAMES.button}
                                            // Set the loading action before mutating
                                            onClick={() => {
                                                setLoadingAction(action.type);
                                                void actionMutation.mutate(action.type);
                                            }}
                                            // Disable all if any is loading
                                            disabled={isLoading || actionMutation.isLoading}
                                            state={isLoading ? 'loading' : undefined}
                                            variant={ButtonVariant.TERTIARY}
                                            aria-label={i18n.get(config.buttonLabelKey)}
                                        >
                                            <span className={GRANT_ACTION_CLASS_NAMES.buttonLabel}>{i18n.get(config.buttonLabelKey)}</span>
                                        </Button>
                                    </li>
                                );
                            })}
                        </ol>
                        {formattedExpiryDate ? (
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} strongest>
                                {i18n.get('capital.overview.grants.item.alerts.offerExpiration', { values: { date: formattedExpiryDate } })}
                            </Typography>
                        ) : null}
                    </div>
                }
            />
        );
    }

    const singleAction = missingActions[0]!;
    const config = ACTION_CONFIG[singleAction.type];

    return (
        <Alert
            className={className}
            type={AlertTypeOption.WARNING}
            title={config.getTitle(formattedExpiryDate)}
            description={
                <Button
                    className={GRANT_ACTION_CLASS_NAMES.button}
                    onClick={() => {
                        setLoadingAction(singleAction.type);
                        void actionMutation.mutate(singleAction.type);
                    }}
                    disabled={!!loadingAction}
                    state={loadingAction ? 'loading' : undefined}
                    variant={ButtonVariant.TERTIARY}
                    aria-label={i18n.get(config.buttonLabelKey)}
                >
                    <span className={GRANT_ACTION_CLASS_NAMES.buttonLabel}>{i18n.get(config.buttonLabelKey)}</span>
                </Button>
            }
        />
    );
};
