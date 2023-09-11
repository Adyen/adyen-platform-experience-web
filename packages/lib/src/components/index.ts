import uuid from '../utils/uuid';
import '../style/index.scss';
import './shared.scss';

// External Components
import {
    AccountHolderComponent,
    BalanceAccountComponent,
    TransactionsComponent,
    TransactionsDetailsComponent,
    LegalEntityComponent,
} from './external/index';
import { ComponentMap } from '../core/types';

export * from './external/index';

/**
 * Maps each component with a Component element.
 */
const componentsMap = {
    accountHolder: AccountHolderComponent,
    balanceAccount: BalanceAccountComponent,
    transactionList: TransactionsComponent,
    transactionDetails: TransactionsDetailsComponent,
    legalEntityDetails: LegalEntityComponent,
};

/**
 * Instantiates a new Component element either by class reference or by name
 * It also assigns a new uuid to each instance, so we can recognize it during the current session
 * @param componentType - class or componentsMap's key
 * @param props - for the new Component element
 * @returns new Component or null
 */
export const getComponent = <Name extends keyof ComponentMap>(componentType: Name, props: any) => {
    const Component = componentsMap[componentType] || null;
    return Component ? new Component({ ...props, id: `${componentType}-${uuid()}` }) : null;
};

/**
 * Gets the configuration for type from componentsConfig
 * @param type - component type
 * @param componentsConfig - global componentsConfiguration
 * @returns component configuration
 */
export const getComponentConfiguration = (type: string, componentsConfig: Record<string, any> = {}) => {
    return componentsConfig[type] || {};
};

export default componentsMap;
