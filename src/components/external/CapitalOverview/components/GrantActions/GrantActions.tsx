import { FunctionalComponent } from 'preact';
import { useCallback } from 'preact/hooks';
import { IMissingAction } from '../../../../../types';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { GrantActionsEmbedded } from '../GrantActionsEmbedded/GrantActionsEmbedded';
import { EMPTY_OBJECT } from '../../../../../utils';
import { GrantActionsHosted } from '../GrantActionsHosted/GrantActionsHosted';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import Alert from '../../../../internal/Alert/Alert';
import './GrantActions.scss';

const CLASSNAMES = {
    actionsTitleSkeleton: 'adyen-pe-grant-actions__actions-title-skeleton',
    actionsDescriptionSkeleton: 'adyen-pe-grant-actions__actions-description-skeleton',
};

type GrantActionsProps = {
    missingActions: IMissingAction[];
    offerExpiresAt?: string;
    className?: string;
};

export const GrantActions: FunctionalComponent<GrantActionsProps> = ({ missingActions = [], offerExpiresAt, className }) => {
    const { getOnboardingConfiguration } = useConfigContext().endpoints;

    const onboardingConfigurationQuery = useFetch({
        fetchOptions: { enabled: !!missingActions.length },
        queryFn: useCallback(async () => {
            return getOnboardingConfiguration?.(EMPTY_OBJECT);
        }, [getOnboardingConfiguration]),
    });

    if (!missingActions.length) {
        return null;
    }

    if (onboardingConfigurationQuery.isFetching) {
        return (
            <Alert
                className={className}
                type={AlertTypeOption.WARNING}
                title={<div className={CLASSNAMES.actionsTitleSkeleton}></div>}
                description={<div className={CLASSNAMES.actionsDescriptionSkeleton}></div>}
            />
        );
    }

    return onboardingConfigurationQuery.data ? (
        <GrantActionsEmbedded
            className={className}
            expirationDate={offerExpiresAt}
            legalEntityId={onboardingConfigurationQuery.data.legalEntityId}
            missingActions={missingActions}
        />
    ) : (
        <GrantActionsHosted missingActions={missingActions} expirationDate={offerExpiresAt} className={className} />
    );
};
