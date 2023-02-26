# BalanceAccount component

The BalanceAccount component is an UI component used to easily show a list of Adyen transactions using the [`/balanceAccounts/{id}` API](#).


## BalanceAccount/ID Endpoint

> URL: https://docs.adyen.com/api-explorer/transfers/3/get/balanceAccounts/_id_


### Required API changes

#### Return account name

We're currently returning the `balanceAccountId`. We need to also return the `balanceAccountName` to show a more meaningful and user-friendly identifier for sub-merchants.

> Ticket: TBD

#### Return more details

We need to return more useful information to show to sub-merchants.

> Ticket: TBD

### Questions

** What fields are relevant for the sub-merchants? **

We currently receive these fields from the API:
- `accountHolderId`
- `balances`
- `defaultCurrencyCode`
- `id`
- `platformPaymentConfiguration`
- `status`
- `timeZone`

Which of these are actually useful? Which ones are missing?

** Possible fields to be added **
- Sweep configurations

