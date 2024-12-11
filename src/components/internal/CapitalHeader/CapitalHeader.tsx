import { FunctionalComponent } from 'preact';
import { Header, HeaderProps } from '../Header';

export type CapitalHeaderProps = Omit<HeaderProps, 'subtitleKey'>;

export const CapitalHeader: FunctionalComponent<CapitalHeaderProps> = props => {
    return <Header {...props} subtitleKey={'capital.poweredByAdyen'} />;
};
