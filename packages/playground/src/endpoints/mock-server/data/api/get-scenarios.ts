/**
 * @description These are the available scenarios matching the API
 * kycexternalapi/src/main/java/com/adyen/services/kycexternalapi/entity/Scenario.java
 */
export const enum Scenarios {
    L = 'L',
    L0 = 'L0',
    L1 = 'L1',
    L1_ID = 'L1_ID',
    L1_IDO = ' L1_IDO',
    L1_NAT = 'L1_NAT',
    L1_IDDOC = 'L1_IDDOC',
    L_REGDOC = 'L_REGDOC',
    L_TAXDOC = 'L_TAXDOC',
    L_PROOFOFADDRESS = 'L_PROOFOFADDRESS',
}

export type Scenario = `${Scenarios}`;

export interface GetScenariosResponse {
    individual?: Scenario[];
    organization?: Scenario[];
    trust?: Scenario[];
    soleProprietorship?: Scenario[];
}
