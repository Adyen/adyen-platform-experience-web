# Transactions component

The Transactions component is an UI component used to easily show a list of Adyen transactions using the [`/transactions` API](#).


## Transactions Endpoint

> URL: https://docs.adyen.com/api-explorer/transfers/3/get/transactions

### Required API changes

#### Add request parameters in the response

The component needs to know the requests used in the request done to the API to be able to know how the list was filtered and show those options in the Filters section header.

> Ticket: TBD

#### Add cursor in a separate field

Right now we're returning a URL which includes a cursor. The merchant has to then get that URL, extract the cursor parameter and use it in the next request. We could simplify this by also returning the cursor in its own field.

Now:
```json
...
"_links": {
    "next": {
        "href": "https://balanceplatform-api-test.adyen.com/btl/v3/transactions?balancePlatform=TestBalancePlatform&createdUntil=2022-11-21T17%3A05%3A06.674Z&createdSince=2022-05-30T15%3A07%3A40Z&cursor=S2B-Ii9XPzgsXEBaNVlwbT9xdCt33M1x2XDB0ZF0xIkpiLlQ0Si8pf2EtMWZkeVdtS32BMYGlSWUQ2Sys33YDJzQyFMZXhpOU8gVzJjNFkiLDtNUH5MdDVXOGle"
    }
}
```

Requested:
```json
...
"_links": {
    "next": {
        "href": "https://balanceplatform-api-test.adyen.com/btl/v3/transactions?balancePlatform=TestBalancePlatform&createdUntil=2022-11-21T17%3A05%3A06.674Z&createdSince=2022-05-30T15%3A07%3A40Z&cursor=S2B-Ii9XP...",
        "cursor": "S2B-Ii9XP..."
    }
}
```

> Ticket: TBD

#### Return account name

We're currently returning the `accountHolderId`. We need to also return the `accountHolderName` to show a more meaningful and user-friendly identifier for sub-merchants.

> Ticket: TBD

#### Return more transaction details

We need to return more useful information to show to sub-merchants in a potential Transaction details page.

> Ticket: TBD


#### Assume `createdUntil` field

Right now the `createdUntil` field is a required field. It would be useful to make it optional and assume the current date if the field is not passed.

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