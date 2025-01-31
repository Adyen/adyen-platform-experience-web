import { FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import { useConfigContext } from '../../../core/ConfigContext';
import { Header, HeaderProps } from '../Header';
import { TypographyVariant } from '../Typography/types';
import './CapitalHeader.scss';
import { getCapitalOfferSubtitleByLegalEntity } from './helpers';

export type CapitalHeaderProps = Omit<HeaderProps, 'subtitleKey'>;

export const CapitalHeader: FunctionalComponent<CapitalHeaderProps> = props => {
    const legalEntity = useConfigContext().extraConfig?.legalEntity;
    const subtitle = useMemo(() => {
        const subtitleKey = getCapitalOfferSubtitleByLegalEntity(legalEntity);
        return subtitleKey ? { subtitleKey } : {};
    }, [legalEntity]);

    return (
        <Header {...props} {...subtitle} subtitleConfig={{ variant: TypographyVariant.CAPTION, classNames: 'adyen-pe-capital-header__subtitle' }} />
    );
};
