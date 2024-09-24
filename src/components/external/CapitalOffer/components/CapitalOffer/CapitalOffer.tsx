import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { ExternalUIComponentProps } from '../../../../types';
import { CapitalOfferProps } from '../../types';
import { CAPITAL_OFFER_CLASS_NAMES } from './constants';
import { CapitalHeader } from '../../../../internal/CapitalHeader';

type CapitalOfferState = 'OfferSelection' | 'OfferSummary';

export const CapitalOffer: FunctionalComponent<ExternalUIComponentProps<CapitalOfferProps>> = ({ hideTitle }) => {
    const [state] = useState<CapitalOfferState>('OfferSelection');

    return (
        <div className={CAPITAL_OFFER_CLASS_NAMES.base}>
            <CapitalHeader hideTitle={hideTitle} titleKey={state === 'OfferSummary' ? 'capital.grantOfferSummary' : 'capital.grantOffer'} />
        </div>
    );
};
