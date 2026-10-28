import type { ReportsDataGridCustomization } from '@adyen/adyen-platform-experience-web';
import type { Presets } from '../../playground/controls';
import { customButton, customLink } from '../../playground/customData';

export const REPORTS_DATA_GRID_PRESETS: Presets<ReportsDataGridCustomization> = {
    '': { label: 'None' },
    hidden: {
        label: 'Hide reportType',
        value: { fields: [{ key: 'reportType', visibility: 'hidden' }] },
    },
    custom: {
        label: 'Custom columns (onDataRetrieve)',
        value: {
            fields: [{ key: 'reportType', visibility: 'hidden' }, { key: '_summary' }, { key: '_action' }, { key: 'reportFile', flex: 0.8 }],
            onDataRetrieve: async reports =>
                reports.map(report => ({
                    ...report,
                    _summary: customLink('Summary'),
                    _action: customButton('Send email', { createdAt: report.createdAt }),
                })),
        },
    },
};
