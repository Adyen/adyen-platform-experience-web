import { Core } from '../../../../core';
import { getMappedValue } from '../../../../utils';
import createGetBalanceAccountsFactory from './createGetBalanceAccountsFactory';

const GetBalanceAccountFactoriesMap = new WeakMap<Core<any, any>, ReturnType<typeof createGetBalanceAccountsFactory>>();

export const getBalanceAccountsFactory = (core: Core<any, any>) => {
    return getMappedValue(core, GetBalanceAccountFactoriesMap, createGetBalanceAccountsFactory)!;
};

export default getBalanceAccountsFactory;
