import { createDynamicTranslationFactory, createKeyFactoryFromConfig } from '@integration-components/core';
import type { TranslationFallbackFunction } from '@integration-components/core';

const originalValueFallback: TranslationFallbackFunction = (_, value) => value;

const reportTypeKeyFactory = createKeyFactoryFromConfig({ prefix: 'reports.common.types.' });
export const getReportType = createDynamicTranslationFactory(reportTypeKeyFactory, originalValueFallback);
