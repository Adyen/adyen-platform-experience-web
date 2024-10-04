import { FunctionalComponent } from 'preact';
import { Header, HeaderProps } from '../Header';

export type CapitalHeaderProps = Omit<HeaderProps, 'subtitleKey'> & {
    hasSubtitle?: boolean;
};

export const CapitalHeader: FunctionalComponent<CapitalHeaderProps> = ({ hasSubtitle = true, ...restOfProps }) => {
    return <Header {...restOfProps} subtitleKey={hasSubtitle ? 'capital.poweredByAdyen' : undefined} />;
};
