import { FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import { Header, HeaderProps } from '@integration-components/ui-components-preact/Header';
import { TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import './CapitalHeader.scss';
import { getCapitalHeaderSubtitleByRegion } from './helpers';

export type CapitalHeaderProps = Omit<HeaderProps, 'subtitleKey'> & {
    region?: string;
};

export const CapitalHeader: FunctionalComponent<CapitalHeaderProps> = ({ region, ...props }) => {
    const subtitle = useMemo(() => {
        const subtitleKey = getCapitalHeaderSubtitleByRegion(region);
        return subtitleKey ? { subtitleKey } : {};
    }, [region]);

    return (
        <Header {...props} {...subtitle} subtitleConfig={{ variant: TypographyVariant.CAPTION, classNames: 'adyen-pe-capital-header__subtitle' }} />
    );
};
