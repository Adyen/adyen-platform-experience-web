export interface BankAccount {
    accountNumber: string;
    accountType: string;
    bankBicSwift: string;
    bankCode?: string;
    bankName: string;
    branchCode: string;
    checkCode?: string;
    bankCity?: string;
    countryCode: string;
    currencyCode: string;
    iban?: string;
    realLastFour?: string;
    virtualAccountNumber?: boolean;
    trustedSource?: boolean;
}
