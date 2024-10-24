import { ExternalComponentType } from '../../../../components/types';
import { isFunction } from '../../../../utils';
import AuthSession from '../AuthSession';
import sessionReady from './sessionReady';

type PermissionRegistry = Record<ExternalComponentType, (context: AuthSession['context']) => boolean | Promise<boolean>>;

const hasAdequatePermission = async (type: ExternalComponentType, session: AuthSession) => {
    await sessionReady(session);
    return permissionRegistry[type]?.(session.context);
};

const permissionRegistry: PermissionRegistry = {
    transactions: context => {
        return isFunction(context.endpoints.getTransactions);
    },
    transactionDetails: context => {
        return isFunction(context.endpoints.getTransaction);
    },
    payouts: context => {
        return isFunction(context.endpoints.getPayouts);
    },
    payoutDetails: context => {
        return isFunction(context.endpoints.getPayout);
    },
    reports: context => {
        return isFunction(context.endpoints.getReports);
    },
};

export default hasAdequatePermission;
