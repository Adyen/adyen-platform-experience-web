# Transaction Details component

The BalanceAccount component is an UI component used to easily show a list of Adyen transactions using the [`/balanceAccounts/{id}` API](#).


## Transaction Details Endpoint

> URL: https://docs.adyen.com/api-explorer/transfers/3/get/transactions/_id_


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
- `balancePlatform`
- `id`
- `accountHolderId`
- `amount`
- `balanceAccountId`
- `bookingDate`
- `category`
- `createdAt`
- `instructedAmount`
- `reference`
- `status`
- `transferId`
- `type`
- `valueDate`

Which of these are actually useful? Which ones are missing?

** Possible fields to be added **
- Transfer lifecycle
- Account holder details
  - Account holder description
  - Balance account description
- PSP modification reference
- PSP modification merchant reference
- Tx variant

### Inconsistencies

We're using similar names for different things.

For example on Transfer #1VVF0D5V3709DX5F we can see the API returns `status` as `booked` and `type` as `fee`, while the BPCA shows both the status and the type as `Fee` and the Reason code as `Approved`.