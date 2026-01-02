import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useCallback, useMemo } from 'preact/hooks';
import StructuredList from '../../../../internal/StructuredList';
import { ListValue, StructuredListItem, StructuredListItemType } from '../../../../internal/StructuredList/types';
import Tabs from '../../../../internal/Tabs/Tabs';
import { DATE_FORMAT_PAYMENT_LINK_TABS } from '../../../../../constants';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import { IPaymentLinkDetails, IShopperAddress } from '../../../../../types';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../../components/internal/Typography/Typography';
import { PaymentLinkActivity } from '../PaymentLinkActivity/PaymentLinkActivity';
import { TabProps } from 'src/components/internal/Tabs/types';
import './PaymentLinkTabs.scss';
import { TranslationKey } from '../../../../../translations';
import CopyText from '../../../../internal/CopyText/CopyText';
import { BACKEND_REDACTED_DATA_MARKER, FRONTEND_REDACTED_DATA_MARKER } from '../../../../constants';
import Link from '../../../../internal/Link/Link';

const CLASSNAMES = {
    root: 'adyen-pe-payment-link-tabs',
    listHeading: 'adyen-pe-payment-link-tabs__list-heading',
    listLabel: 'adyen-pe-payment-link-tabs__list-label',
    listValue: 'adyen-pe-payment-link-tabs__list-value',
};

type PaymentLinkTabsProps = {
    paymentLink: IPaymentLinkDetails;
};

type ListItems = Record<'linkInformation' | 'shopperInformation' | 'shippingAddress' | 'billingAddress', StructuredListItem[]>;

export const PaymentLinkTabs = ({ paymentLink }: PaymentLinkTabsProps) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();

    const isAddressRedacted = useCallback((address: IShopperAddress) => {
        return Object.values(address).some(value => value === BACKEND_REDACTED_DATA_MARKER);
    }, []);

    const listItems = useMemo<ListItems>(() => {
        const linkType = paymentLink.linkInformation.linkType;
        const items: ListItems = {
            linkInformation: [
                {
                    key: 'paymentLinks.details.fields.paymentLinkId',
                    value: paymentLink.linkInformation.paymentLinkId,
                    config: { isCopyable: true, linkUrl: paymentLink.linkInformation.paymentLink },
                },
                {
                    key: 'paymentLinks.details.fields.store',
                    value: paymentLink.linkInformation.storeCode,
                },
                {
                    key: 'paymentLinks.details.fields.merchantReference',
                    value: paymentLink.linkInformation.merchantReference,
                },
                {
                    key: 'paymentLinks.details.fields.createdOn',
                    value: dateFormat(paymentLink.linkInformation.creationDate, DATE_FORMAT_PAYMENT_LINK_TABS),
                },
                {
                    key: 'paymentLinks.details.fields.expiresOn',
                    value: dateFormat(paymentLink.linkInformation.expirationDate, DATE_FORMAT_PAYMENT_LINK_TABS),
                },
                {
                    key: 'paymentLinks.details.fields.linkType',
                    value: i18n.has(`payByLink.common.linkType.${linkType}`) ? i18n.get(`payByLink.common.linkType.${linkType}`) : linkType,
                },
                {
                    key: 'paymentLinks.details.fields.description',
                    value: paymentLink.linkInformation.description,
                },
            ],
            shopperInformation: [
                {
                    key: 'paymentLinks.details.fields.shopper.reference',
                    value: paymentLink.shopperInformation?.shopperReference,
                },
                {
                    key: 'paymentLinks.details.fields.shopper.fullName',
                    value: [paymentLink.shopperInformation?.shopperName?.firstName, paymentLink.shopperInformation?.shopperName?.lastName]
                        .filter(Boolean)
                        .join(' '),
                    config: { isCopyable: true },
                },
                {
                    key: 'paymentLinks.details.fields.shopper.email',
                    value: paymentLink.shopperInformation?.shopperEmail,
                    config: { isCopyable: true },
                },
                {
                    key: 'paymentLinks.details.fields.shopper.phone',
                    value: paymentLink.shopperInformation?.telephoneNumber,
                    config: { isCopyable: true },
                },
                {
                    key: 'paymentLinks.details.fields.shopper.country',
                    value: paymentLink.shopperInformation?.shopperCountry,
                },
                ...(paymentLink.shopperInformation?.shippingAddress && isAddressRedacted(paymentLink.shopperInformation?.shippingAddress)
                    ? [
                          {
                              key: 'paymentLinks.details.fields.shippingAddress.title' as TranslationKey,
                              value: FRONTEND_REDACTED_DATA_MARKER,
                          },
                      ]
                    : []),
                ...(paymentLink.shopperInformation?.billingAddress && isAddressRedacted(paymentLink.shopperInformation?.billingAddress)
                    ? [
                          {
                              key: 'paymentLinks.details.fields.billingAddress.title' as TranslationKey,
                              value: FRONTEND_REDACTED_DATA_MARKER,
                          },
                      ]
                    : []),
            ],
            shippingAddress:
                !paymentLink.shopperInformation?.shippingAddress || isAddressRedacted(paymentLink.shopperInformation?.shippingAddress)
                    ? []
                    : [
                          {
                              key: 'paymentLinks.details.fields.shippingAddress.street',
                              value: paymentLink.shopperInformation?.shippingAddress?.street,
                              config: { isCopyable: true },
                          },
                          {
                              key: 'paymentLinks.details.fields.shippingAddress.houseNumberOrName',
                              value: paymentLink.shopperInformation?.shippingAddress?.houseNumberOrName,
                              config: { isCopyable: true },
                          },
                          {
                              key: 'paymentLinks.details.fields.shippingAddress.country',
                              value: paymentLink.shopperInformation?.shippingAddress?.country,
                          },
                          {
                              key: 'paymentLinks.details.fields.shippingAddress.city',
                              value: paymentLink.shopperInformation?.shippingAddress?.city,
                              config: { isCopyable: true },
                          },
                          {
                              key: 'paymentLinks.details.fields.shippingAddress.postalCode',
                              value: paymentLink.shopperInformation?.shippingAddress?.postalCode,
                              config: { isCopyable: true },
                          },
                      ],
            billingAddress:
                !paymentLink.shopperInformation?.billingAddress || isAddressRedacted(paymentLink.shopperInformation?.billingAddress)
                    ? []
                    : [
                          {
                              key: 'paymentLinks.details.fields.billingAddress.street',
                              value: paymentLink.shopperInformation?.billingAddress?.street,
                              config: { isCopyable: true },
                          },
                          {
                              key: 'paymentLinks.details.fields.billingAddress.houseNumberOrName',
                              value: paymentLink.shopperInformation?.billingAddress?.houseNumberOrName,
                              config: { isCopyable: true },
                          },
                          {
                              key: 'paymentLinks.details.fields.billingAddress.country',
                              value: paymentLink.shopperInformation?.billingAddress?.country,
                          },
                          {
                              key: 'paymentLinks.details.fields.billingAddress.city',
                              value: paymentLink.shopperInformation?.billingAddress?.city,
                              config: { isCopyable: true },
                          },
                          {
                              key: 'paymentLinks.details.fields.billingAddress.postalCode',
                              value: paymentLink.shopperInformation?.billingAddress?.postalCode,
                              config: { isCopyable: true },
                          },
                      ],
        };

        // Filter out items with empty values from each group
        return Object.fromEntries(
            Object.entries(items).map(([category, categoryItems]) => [
                category,
                categoryItems.filter(item => item.value != null && item.value !== '' && item.value !== undefined),
            ])
        ) as ListItems;
    }, [paymentLink, dateFormat, i18n, isAddressRedacted]);

    const renderListItemLabel = useCallback((label: string) => <div className={CLASSNAMES.listLabel}>{label}</div>, []);
    const renderListItemValue = useCallback((value: ListValue, key: TranslationKey, type: StructuredListItemType | undefined, config: any) => {
        let transformedValue;
        if (value && value.toString().includes(BACKEND_REDACTED_DATA_MARKER)) {
            transformedValue = FRONTEND_REDACTED_DATA_MARKER;
        } else if (config?.isCopyable && value && value !== '') {
            const visibleText = config?.linkUrl ? (
                <Link href={config.linkUrl} target="_blank">
                    {value.toString()}
                </Link>
            ) : undefined;
            transformedValue = <CopyText textToCopy={value.toString()} visibleText={visibleText} type={'Default'} />;
        } else {
            transformedValue = value;
        }

        return <div className={CLASSNAMES.listValue}>{transformedValue}</div>;
    }, []);

    const tabs = useMemo<TabProps<string>[]>(
        () =>
            [
                {
                    id: 'linkInformation',
                    label: 'paymentLinks.details.tabs.linkInformation',
                    content: (
                        <StructuredList
                            items={listItems.linkInformation}
                            align="start"
                            layout="4-8"
                            renderLabel={renderListItemLabel}
                            renderValue={renderListItemValue}
                        />
                    ),
                },
                {
                    id: 'shopperInformation',
                    label: 'paymentLinks.details.tabs.shopperInformation',
                    content: (
                        <>
                            <StructuredList
                                items={listItems.shopperInformation}
                                align="start"
                                layout="4-8"
                                renderLabel={renderListItemLabel}
                                renderValue={renderListItemValue}
                            />

                            {listItems.shippingAddress.length > 0 && (
                                <>
                                    <Typography variant={TypographyVariant.CAPTION} stronger className={CLASSNAMES.listHeading}>
                                        {i18n.get('paymentLinks.details.fields.shippingAddress.title')}
                                    </Typography>
                                    <StructuredList
                                        items={listItems.shippingAddress}
                                        align="start"
                                        layout="4-8"
                                        renderLabel={renderListItemLabel}
                                        renderValue={renderListItemValue}
                                    />
                                </>
                            )}

                            {listItems.billingAddress.length > 0 && (
                                <>
                                    <Typography variant={TypographyVariant.CAPTION} stronger className={CLASSNAMES.listHeading}>
                                        {i18n.get('paymentLinks.details.fields.billingAddress.title')}
                                    </Typography>
                                    <StructuredList
                                        items={listItems.billingAddress}
                                        align="start"
                                        layout="4-8"
                                        renderLabel={renderListItemLabel}
                                        renderValue={renderListItemValue}
                                    />
                                </>
                            )}
                        </>
                    ),
                },
                {
                    id: 'activity',
                    label: 'paymentLinks.details.tabs.activity',
                    content: <PaymentLinkActivity activities={paymentLink.paymentLinkActivities ?? []} />,
                },
            ] as TabProps<string>[],
        [listItems, renderListItemLabel, renderListItemValue, i18n, paymentLink.paymentLinkActivities]
    );

    return (
        <div className={CLASSNAMES.root}>
            <Tabs tabs={tabs} />
        </div>
    );
};
