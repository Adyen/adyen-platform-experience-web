<script setup lang="ts">
import './PaymentLinkSkeleton.scss';

const CLASSNAMES = {
    root: 'adyen-pe-payment-link-skeleton',
    summaryContainer: 'adyen-pe-payment-link-skeleton__summary-container',
    status: 'adyen-pe-payment-link-skeleton__status',
    amount: 'adyen-pe-payment-link-skeleton__amount',
    expirationDate: 'adyen-pe-payment-link-skeleton__expiration-date',
    tabsContainer: 'adyen-pe-payment-link-skeleton__tabs-container',
    tabLabelsContainer: 'adyen-pe-payment-link-skeleton__tab-labels-container',
    tabLabel: 'adyen-pe-payment-link-skeleton__tab-label',
    fieldsContainer: 'adyen-pe-payment-link-skeleton__fields-container',
    fieldContainer: 'adyen-pe-payment-link-skeleton__field-container',
    fieldLabel: 'adyen-pe-payment-link-skeleton__field-label',
    fieldValue: 'adyen-pe-payment-link-skeleton__field-value',
};

const TAB_LABEL_COUNT = 3;
const FIELD_COUNT = 6;
</script>

<template>
    <div :class="CLASSNAMES.root">
        <div :class="CLASSNAMES.summaryContainer">
            <div :class="CLASSNAMES.status" />
            <div :class="CLASSNAMES.amount" />
            <div :class="CLASSNAMES.expirationDate" />
        </div>
        <div :class="CLASSNAMES.tabsContainer">
            <div :class="CLASSNAMES.tabLabelsContainer">
                <div v-for="index in TAB_LABEL_COUNT" :key="index" :class="CLASSNAMES.tabLabel" />
            </div>
            <div :class="CLASSNAMES.fieldsContainer">
                <div v-for="index in FIELD_COUNT" :key="index" :class="CLASSNAMES.fieldContainer">
                    <div :class="CLASSNAMES.fieldLabel" />
                    <div :class="CLASSNAMES.fieldValue" />
                </div>
            </div>
        </div>
    </div>
</template>
