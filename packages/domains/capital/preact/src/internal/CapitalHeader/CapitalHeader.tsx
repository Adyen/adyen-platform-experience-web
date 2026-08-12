import { FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import { Header, HeaderProps } from '@integration-components/ui-components-preact/Header';
import { TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import './CapitalHeader.scss';
import { useCoreContext } from '@integration-components/core/preact';

export type CapitalHeaderProps = Omit<HeaderProps, 'subtitleKey'> & {
    region?: string;
};

export const CapitalHeader: FunctionalComponent<CapitalHeaderProps> = ({ region, ...props }) => {
    const { i18n } = useCoreContext();
    const subtitle = useMemo(() => {
        const subtitleKey = `capital.common.loanProviderInfo.${region}`;
        return i18n.has(subtitleKey) ? { subtitleKey } : {};
    }, [i18n, region]);

    return (
        <Header {...props} {...subtitle} subtitleConfig={{ variant: TypographyVariant.CAPTION, classNames: 'adyen-pe-capital-header__subtitle' }} />
    );
};
