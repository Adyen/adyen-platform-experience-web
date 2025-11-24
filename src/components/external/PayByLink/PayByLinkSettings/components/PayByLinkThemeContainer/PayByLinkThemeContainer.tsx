import { _UIComponentProps } from '../../../../../types';
import { useStoreTheme } from '../../hooks/useStoreTheme';
import { ThemeForm } from '../ThemeForm';
import './PayByLinkThemeContainer.scss';

interface PayByLinkThemeContainerProps {
    selectedStore: string;
}

export const PayByLinkThemeContainer = ({ selectedStore }: PayByLinkThemeContainerProps) => {
    const { theme } = useStoreTheme(selectedStore);

    return (
        <section className="adyen-pe-pay-by-link-theme">
            <ThemeForm theme={theme} />
            <img src={theme?.logoUrl} alt="" />
        </section>
    );
};
