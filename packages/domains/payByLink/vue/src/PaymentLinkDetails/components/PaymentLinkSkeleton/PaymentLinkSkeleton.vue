<script setup lang="ts">
import styles from './PaymentLinkSkeleton.module.scss';

const TAB_LABEL_COUNT = 3;
const FIELD_COUNT = 6;
</script>

<template>
    <div :class="styles.root">
        <div :class="styles.summaryContainer">
            <div :class="styles.status" />
            <div :class="styles.amount" />
            <div :class="styles.expirationDate" />
        </div>
        <div :class="styles.tabsContainer">
            <div :class="styles.tabLabelsContainer">
                <div v-for="index in TAB_LABEL_COUNT" :key="index" :class="styles.tabLabel" />
            </div>
            <div :class="styles.fieldsContainer">
                <div v-for="index in FIELD_COUNT" :key="index" :class="styles.fieldContainer">
                    <div :class="styles.fieldLabel" />
                    <div :class="styles.fieldValue" />
                </div>
            </div>
        </div>
    </div>
</template>
