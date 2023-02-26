# AccountHolder component

The AccountHolder component is an UI component used to easily show a list of Adyen transactions using the [`/accountHolders/{id}` API](#).


## Transactions Endpoint

> URL: https://docs.adyen.com/api-explorer/transfers/3/get/accountHolders/_id_


### Required API changes

#### Return account name

We're currently returning the `accountHolderId`. We need to also return the `accountHolderName` to show a more meaningful and user-friendly identifier for sub-merchants.

> Ticket: TBD

#### Return more details

We need to return more useful information to show to sub-merchants.

> Ticket: TBD

### Questions

** What fields are relevant for the sub-merchants? **

We currently receive these fields from the API:
- `balancePlatform`
- `contactDetails`
- `description`
- `id`
- `legalEntityId`
- `status`

Which of these are actually useful? Which ones are missing?

** Possible fields to be added **
- More details
  - Account holder reference
  - Creation date
  - Capabilities
- Legal identity details
  - Legal entity type
  - Legal name of the company
  - Trading name
  - Registration number
  - Tax number
  - Tax exempt
  - Email
  - Registered business address
  - Additional business address
- Entity associations
- Transfer instruments

