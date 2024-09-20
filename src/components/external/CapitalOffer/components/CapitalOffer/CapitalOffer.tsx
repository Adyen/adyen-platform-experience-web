import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../internal/Typography/types';
import { ExternalUIComponentProps } from '../../../../types';
import { CapitalOfferProps } from '../../types';
import { CAPITAL_OFFER_CLASS_NAMES } from './constants';

type CapitalOfferState = 'OfferSelection' | 'OfferSummary';

export const CapitalOffer: FunctionalComponent<ExternalUIComponentProps<CapitalOfferProps>> = ({ hideTitle }) => {
    const { i18n } = useCoreContext();
    const [state] = useState<CapitalOfferState>('OfferSelection');

    return (
        <div className={CAPITAL_OFFER_CLASS_NAMES.base}>
            {!hideTitle && (
                <Typography variant={TypographyVariant.TITLE} medium className={CAPITAL_OFFER_CLASS_NAMES.title}>
                    {i18n.get(state === 'OfferSummary' ? 'capital.grantOfferSummary' : 'capital.grantOffer')}
                </Typography>
            )}
        </div>
    );
};
