import { IShopperInformation } from '../../../src';
import { BACKEND_REDACTED_DATA_MARKER } from '../../../src/components/constants';

export const redactShopperInformation = (shopperInformation: IShopperInformation) => ({
    ...shopperInformation,
    ...(shopperInformation.billingAddress
        ? {
              billingAddress: {
                  city: BACKEND_REDACTED_DATA_MARKER,
                  country: BACKEND_REDACTED_DATA_MARKER,
                  houseNumberOrName: BACKEND_REDACTED_DATA_MARKER,
                  postalCode: BACKEND_REDACTED_DATA_MARKER,
                  street: BACKEND_REDACTED_DATA_MARKER,
                  stateOrProvince: BACKEND_REDACTED_DATA_MARKER,
              },
          }
        : {}),
    ...(shopperInformation.shippingAddress
        ? {
              shippingAddress: {
                  city: BACKEND_REDACTED_DATA_MARKER,
                  country: BACKEND_REDACTED_DATA_MARKER,
                  houseNumberOrName: BACKEND_REDACTED_DATA_MARKER,
                  postalCode: BACKEND_REDACTED_DATA_MARKER,
                  street: BACKEND_REDACTED_DATA_MARKER,
                  stateOrProvince: BACKEND_REDACTED_DATA_MARKER,
              },
          }
        : {}),
    ...(shopperInformation.shopperEmail ? { shopperEmail: BACKEND_REDACTED_DATA_MARKER } : {}),
    ...(shopperInformation.shopperName ? { shopperName: { firstName: BACKEND_REDACTED_DATA_MARKER, lastName: BACKEND_REDACTED_DATA_MARKER } } : {}),
    ...(shopperInformation.telephoneNumber ? { telephoneNumber: BACKEND_REDACTED_DATA_MARKER } : {}),
});
