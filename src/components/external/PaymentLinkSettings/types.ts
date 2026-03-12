import { UIElementProps } from '../../types';

/** Props for the PaymentLinkSettings component */
export interface PaymentLinkSettingsProps extends UIElementProps {
    /** Store IDs to filter settings by */
    storeIds?: string[] | string;
}

/**
 * Public component props exported from the Element
 */
export type PaymentLinkSettingsComponentProps = PaymentLinkSettingsProps;

/** Main configuration interface */
export interface PaymentLinkSettingsConfig {
    // Placeholder for future configuration options
}
