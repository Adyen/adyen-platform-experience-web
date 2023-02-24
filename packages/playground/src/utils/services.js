import { httpGet } from './http';

export const getMyTransactions = request =>
    httpGet('transactions', request)
        .then(response => {
            if (response.error) throw 'Could not retrieve the list of transactions';
            return response;
        })
        .catch(console.error);

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
