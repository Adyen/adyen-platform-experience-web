import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { ExternalUIComponentProps } from '../../../../types';
import { CapitalOfferProps } from '../../types';
import { CAPITAL_OFFER_CLASS_NAMES } from './constants';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import './CapitalOffer.scss';
import { CapitalOfferSelection } from '../CapitalOfferSelection/CapitalOfferSelection';

type CapitalOfferState = 'OfferSelection' | 'OfferSummary';

export const CapitalOffer: FunctionalComponent<ExternalUIComponentProps<CapitalOfferProps>> = ({ hideTitle, dynamicOffersConfig }) => {
    const [state] = useState<CapitalOfferState>('OfferSelection');

    const config = dynamicOffersConfig;

    return (
        <div className={CAPITAL_OFFER_CLASS_NAMES.base}>
            <CapitalHeader
                hideTitle={hideTitle}
                titleKey={state === 'OfferSummary' ? 'capital.businessFinancingSummary' : 'capital.businessFinancing'}
            />
            {config && <CapitalOfferSelection config={config} onBack={() => console.log('back')} onReviewOffer={() => console.log('reviewed')} />}
        </div>
    );
};
