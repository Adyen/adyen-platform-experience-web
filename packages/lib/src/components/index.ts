import uuid from '../utils/uuid';
import './shared.scss';

// External Components
import Address from './Address';
import Transactions from './Transactions';
import TransactionDetails from './TransactionDetails';
import AccountHolder from './AccountHolder';

/**
 * Maps each component with a Component element.
 */
const componentsMap = {
    transactions: Transactions,
    transactionDetails: TransactionDetails,
    accountHolder: AccountHolder,
    address: Address,

    default: null,
};

/**
 * Instantiates a new Component element either by class reference or by name
 * It also assigns a new uuid to each instance, so we can recognize it during the current session
 * @param componentType - class or componentsMap's key
 * @param props - for the new Component element
 * @returns new Component or null
 */
export const getComponent = (componentType, props) => {
    const Component = componentsMap[componentType] || componentsMap.default;
    return Component ? new Component({ ...props, id: `${componentType}-${uuid()}` }) : null;
};

/**
 * Gets the configuration for type from componentsConfig
 * @param type - component type
 * @param componentsConfig - global componentsConfiguration
 * @returns component configuration
 */
export const getComponentConfiguration = (type: string, componentsConfig = {}) => {
    let pmType = type;

    return componentsConfig[pmType] || {};
};

export default componentsMap;
