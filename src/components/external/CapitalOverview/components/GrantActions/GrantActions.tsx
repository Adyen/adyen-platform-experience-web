import { FunctionalComponent } from 'preact';
import { useCallback } from 'preact/hooks';
import { IMissingAction } from '../../../../../types';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { GrantActionsEmbedded } from '../GrantActionsEmbedded/GrantActionsEmbedded';
import { EMPTY_OBJECT } from '../../../../../utils';
import { GrantActionsHosted } from '../GrantActionsHosted/GrantActionsHosted';
import Card from '../../../../internal/Card/Card';
import Spinner from '../../../../internal/Spinner';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import './GrantActions.scss';
import { useMissingActionsPolling } from './hooks/useMissingActionsPolling';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../internal/Typography/types';

const CLASSNAMES = {
    loadingContainer: 'adyen-pe-grant-actions__loading-container',
};

type GrantActionsProps = {
    grantId: string;
    missingActions: IMissingAction[];
    offerExpiresAt?: string;
    className?: string;
    onComplete: () => void;
};

export const GrantActions: FunctionalComponent<GrantActionsProps> = ({
    grantId,
    missingActions: initialMissingActions,
    offerExpiresAt,
    className,
    onComplete,
}) => {
    const { i18n } = useCoreContext();
    const { getOnboardingConfiguration } = useConfigContext().endpoints;
    const { missingActions, isPollingComplete, forcePollingComplete } = useMissingActionsPolling({ grantId, initialMissingActions });

    const onboardingConfigurationQuery = useFetch({
        fetchOptions: {
            enabled: isPollingComplete && !!missingActions.length,
            onError: forcePollingComplete,
        },
        queryFn: useCallback(async () => {
            return getOnboardingConfiguration?.(EMPTY_OBJECT);
        }, [getOnboardingConfiguration]),
    });

    if (!missingActions.length) {
        return null;
    }

    if (!isPollingComplete || onboardingConfigurationQuery.isFetching) {
        return (
            <Card classNameModifiers={className ? [className] : []} filled noOutline noPadding>
                <div className={CLASSNAMES.loadingContainer}>
                    <Spinner size="large" inline />
                    <Typography variant={TypographyVariant.BODY} strongest>
                        {i18n.get('capital.overview.grants.item.processingLongRequest')}
                    </Typography>
                </div>
            </Card>
        );
    }

    return onboardingConfigurationQuery.data ? (
        <GrantActionsEmbedded
            className={className}
            expirationDate={offerExpiresAt}
            legalEntityId={onboardingConfigurationQuery.data.legalEntityId}
            missingActions={missingActions}
            onComplete={onComplete}
        />
    ) : (
        <GrantActionsHosted missingActions={missingActions} expirationDate={offerExpiresAt} className={className} />
    );
};
