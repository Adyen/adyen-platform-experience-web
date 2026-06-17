import { FunctionalComponent } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { isCapitalRegionSupported } from '../../../internal/CapitalHeader/helpers';
import { ExternalUIComponentProps, IGrantOfferResponseDTO } from '@integration-components/types';
import { useConfigContext } from '@integration-components/core/preact';
import { useFetch } from '@integration-components/hooks-preact';
import { useLandedPageEvent } from '@integration-components/hooks-preact/useEventDispatcher/useLandedPageEvent';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { CapitalOfferProps } from '../../types';
import { CapitalErrorMessageDisplay } from '../utils/CapitalErrorMessageDisplay';
import { CAPITAL_OFFER_CLASS_NAMES, sharedCapitalOfferAnalyticsEventProperties } from './constants';
import { CapitalHeader } from '../../../internal/CapitalHeader';
import { CapitalOfferSelection } from '../CapitalOfferSelection/CapitalOfferSelection';
import { CapitalOfferSummary } from '../CapitalOfferSummary/CapitalOfferSummary';
import './CapitalOffer.scss';
import { getEnhancedCapitalState } from '../../../utils/capital/getCapitalState';

type CapitalOfferState = 'OfferSelection' | 'OfferSummary';

const sharedAnalyticsEventProperties = {
    ...sharedCapitalOfferAnalyticsEventProperties,
    subCategory: 'Capital offer',
} as const;

const DynamicCapitalOffer: FunctionalComponent<ExternalUIComponentProps<CapitalOfferProps>> = ({
    externalCapitalState,
    hideTitle,
    onContactSupport,
    onFundsRequest,
    onOfferDismiss,
    onOfferSelect,
}) => {
    const [selectedAmount, setSelectedAmount] = useState<number | undefined>(undefined);
    const [selectedTerm, setSelectedTerm] = useState<number | undefined>(undefined);
    const [selectedOffer, setSelectedOffer] = useState<IGrantOfferResponseDTO>();

    const { getCapitalState } = useConfigContext().endpoints;

    const { data: internalCapitalState, error: capitalStateError } = useFetch({
        fetchOptions: { enabled: !externalCapitalState && !!getCapitalState },
        queryFn: useCallback(async () => {
            return getCapitalState?.(EMPTY_OBJECT, { query: EMPTY_OBJECT });
        }, [getCapitalState]),
    });

    const state = externalCapitalState || getEnhancedCapitalState(internalCapitalState);

    const onOfferSelectHandler = useCallback(
        (data: IGrantOfferResponseDTO) => {
            if (onOfferSelect) {
                onOfferSelect(data);
            } else {
                setSelectedOffer(data);
            }
        },
        [onOfferSelect]
    );

    const capitalOfferState = useMemo<CapitalOfferState>(() => {
        return selectedOffer ? 'OfferSummary' : 'OfferSelection';
    }, [selectedOffer]);

    useLandedPageEvent({ ...sharedAnalyticsEventProperties, label: 'Capital offer' });

    return (
        <div className={CAPITAL_OFFER_CLASS_NAMES.base}>
            <CapitalHeader
                hasDivider
                hideTitle={hideTitle}
                titleKey={capitalOfferState === 'OfferSummary' ? 'capital.offer.summary.title' : 'capital.offer.selection.title'}
            />
            {capitalOfferState === 'OfferSelection' && (
                <CapitalOfferSelection
                    selectedAmount={selectedAmount}
                    onSelectedAmountChange={setSelectedAmount}
                    selectedTerm={selectedTerm}
                    onSelectedTermChange={setSelectedTerm}
                    capitalState={state}
                    capitalStateError={capitalStateError}
                    onOfferDismiss={onOfferDismiss}
                    onOfferSelect={onOfferSelectHandler}
                    onContactSupport={onContactSupport}
                />
            )}
            {capitalOfferState === 'OfferSummary' && (
                <CapitalOfferSummary
                    grantOffer={selectedOffer!}
                    onBack={() => setSelectedOffer(undefined)}
                    onFundsRequest={onFundsRequest}
                    onContactSupport={onContactSupport}
                />
            )}
        </div>
    );
};

export const CapitalOffer: FunctionalComponent<ExternalUIComponentProps<CapitalOfferProps>> = props => {
    const legalEntity = useConfigContext()?.extraConfig?.legalEntity;
    const isRegionSupported = useMemo(() => isCapitalRegionSupported(legalEntity), [legalEntity]);

    if (!isRegionSupported) {
        return (
            <div className={CAPITAL_OFFER_CLASS_NAMES.errorContainer}>
                <CapitalHeader hideTitle={props.hideTitle} titleKey={'capital.common.title'} />
                <CapitalErrorMessageDisplay unsupportedRegion />
            </div>
        );
    }

    return <DynamicCapitalOffer {...props} />;
};
