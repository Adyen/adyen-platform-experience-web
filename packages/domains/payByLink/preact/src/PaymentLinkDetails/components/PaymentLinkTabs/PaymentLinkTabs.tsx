import { useCoreContext } from '@integration-components/core/preact';
import { useCallback, useMemo } from 'preact/hooks';
import StructuredList from '@integration-components/ui-components-preact/StructuredList';
import { ListValue, StructuredListItem, StructuredListItemType } from '@integration-components/ui-components-preact/StructuredList/types';
import Tabs from '@integration-components/ui-components-preact/Tabs/Tabs';
import { useTimezoneAwareDateFormatting } from '@integration-components/hooks-preact';
import { IPaymentLinkDetails } from '@integration-components/types';
import { TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { PaymentLinkActivity } from '../PaymentLinkActivity/PaymentLinkActivity';
import { TabProps } from '@integration-components/ui-components-preact/Tabs/types';
import './PaymentLinkTabs.scss';
import { TranslationKey } from '@integration-components/core';
import CopyText from '@integration-components/ui-components-preact/CopyText/CopyText';
import { BACKEND_REDACTED_DATA_MARKER, FRONTEND_REDACTED_DATA_MARKER, buildPaymentLinkListItems } from '@integration-components/payByLink/domain';
import Link from '@integration-components/ui-components-preact/Link/Link';

const CLASSNAMES = {
    root: 'adyen-pe-payment-link-tabs',
    list: 'adyen-pe-payment-link-tabs__list',
    listHeading: 'adyen-pe-payment-link-tabs__list-heading',
    listLabel: 'adyen-pe-payment-link-tabs__list-label',
    listValue: 'adyen-pe-payment-link-tabs__list-value',
};

type PaymentLinkTabsProps = {
    paymentLink: IPaymentLinkDetails;
};

export const PaymentLinkTabs = ({ paymentLink }: PaymentLinkTabsProps) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();

    const listItems = useMemo(() => {
        const items = buildPaymentLinkListItems(paymentLink, { i18n, dateFormat });
        const toStructuredListItems = (categoryItems: (typeof items)['linkInformation']): StructuredListItem[] =>
            categoryItems.map(({ key, value, isCopyable, linkUrl }) => ({
                key,
                value,
                config: { isCopyable, linkUrl },
            }));

        return {
            linkInformation: toStructuredListItems(items.linkInformation),
            shopperInformation: toStructuredListItems(items.shopperInformation),
            shippingAddress: toStructuredListItems(items.shippingAddress),
            billingAddress: toStructuredListItems(items.billingAddress),
        };
    }, [paymentLink, dateFormat, i18n]);

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
                    label: 'payByLink.details.tabs.linkInformation',
                    content: (
                        <StructuredList
                            classNames={CLASSNAMES.list}
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
                    label: 'payByLink.details.tabs.shopperInformation',
                    content: (
                        <>
                            <StructuredList
                                classNames={CLASSNAMES.list}
                                items={listItems.shopperInformation}
                                align="start"
                                layout="4-8"
                                renderLabel={renderListItemLabel}
                                renderValue={renderListItemValue}
                            />

                            {listItems.shippingAddress.length > 0 && (
                                <>
                                    <Typography variant={TypographyVariant.CAPTION} stronger className={CLASSNAMES.listHeading}>
                                        {i18n.get('payByLink.details.fields.shippingAddress.title')}
                                    </Typography>
                                    <StructuredList
                                        classNames={CLASSNAMES.list}
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
                                        {i18n.get('payByLink.details.fields.billingAddress.title')}
                                    </Typography>
                                    <StructuredList
                                        classNames={CLASSNAMES.list}
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
                    label: 'payByLink.details.tabs.activity',
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
