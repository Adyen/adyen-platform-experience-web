import { httpGet } from './http';

export const getMyTransactions = (request = {}) => {
    const LIMIT = 20;
    const {
        createdSince = '2022-05-30T15:07:40Z',
        createdUntil = new Date().toISOString(),
        balancePlatform = process.env.VITE_BALANCE_PLATFORM,
        accountHolderId,
        balanceAccountId,
        cursor,
    } = request;

    const searchParams = {
        limit: LIMIT,
        ...(createdSince && { createdSince }),
        ...(createdUntil && { createdUntil }),
        ...(balancePlatform && { balancePlatform }),
        ...(accountHolderId && { accountHolderId }),
        ...(balanceAccountId && { balanceAccountId }),
        ...(cursor && { cursor }),
    };
    return httpGet('transactions', searchParams)
        .then(response => {
            if (response.error) throw 'Could not retrieve the list of transactions';
            return response;
        })
        .catch(console.error);
};

export const getTransactionById = id =>
    httpGet(`transactions/${id}`)
        .then(response => {
            if (response.error) throw 'Could not retrieve the required transaction';
            return response;
        })
        .catch(console.error);

export const getBalanceAccountById = id =>
    httpGet(`balanceAccounts/${id}`)
        .then(response => {
            if (response.error) throw 'Could not retrieve the required balance account';
            return response;
        })
        .catch(console.error);

export const getAccountHolderById = id =>
    httpGet(`accountHolders/${id}`)
        .then(response => {
            if (response.error) throw 'Could not retrieve the required account holder';
            return response;
        })
        .catch(console.error);

export const getLegalEntityById = id =>
    httpGet(`legalEntities/${id}`)
        .then(response => {
            if (response.error) throw 'Could not retrieve the required account holder';
            return response;
        })
        .catch(console.error);
