<script setup lang="ts">
import WarningDiamondIcon from '@adyen/ui-assets-icons-16/vue/warning-diamond';
import { REPORTS_TABLE_CLASS_NAMES } from '../../../../domain/src';
</script>

<template>
    <WarningDiamondIcon :class="REPORTS_TABLE_CLASS_NAMES.downloadErrorIcon" />
</template>
