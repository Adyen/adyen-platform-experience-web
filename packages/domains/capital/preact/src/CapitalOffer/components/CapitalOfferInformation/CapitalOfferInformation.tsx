import { IGrantOfferResponseDTO } from '@integration-components/types';
import { useCoreContext } from '@integration-components/core/preact';
import { useMemo } from 'preact/hooks';
import StructuredList from '@integration-components/ui-components-preact/StructuredList';
import { useTimezoneAwareDateFormatting } from '@integration-components/hooks-preact';
import { calculatePercentageFromBasisPoints, calculateTimestampAfterDays } from '@integration-components/capital/domain';
import { DATE_FORMAT_CAPITAL_OVERVIEW } from '@integration-components/utils';
import { useFormatTermLabel } from '../hooks/useFormatTermLabel';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import { StructuredListItem } from '@integration-components/ui-components-preact/StructuredList/types';
import './CapitalOfferInformation.scss';

export const CapitalOfferInformation = ({ data, hasSingleTerm }: { data: IGrantOfferResponseDTO; hasSingleTerm: boolean }) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const maximumRepaymentPeriodDate = useMemo(() => {
        const days = data.maximumRepaymentPeriodDays;
        const date = days && calculateTimestampAfterDays(days);
        return date && dateFormat(date, DATE_FORMAT_CAPITAL_OVERVIEW);
    }, [data.maximumRepaymentPeriodDays, dateFormat]);

    const formatTermLabel = useFormatTermLabel();

    const items = useMemo(
        () =>
            [
                { key: 'capital.common.fields.fees', value: i18n.amount(data.feesAmount.value, data.feesAmount.currency) },
                {
                    key: 'capital.common.fields.totalRepaymentAmount',
                    value: i18n.amount(data.totalAmount.value, data.totalAmount.currency),
                },
                {
                    key: 'capital.common.fields.dailyRepaymentRate',
                    value: i18n.get('capital.common.values.percentage', {
                        values: { percentage: calculatePercentageFromBasisPoints(data.repaymentRate) },
                    }),
                },
                ...(hasSingleTerm
                    ? [
                          {
                              key: 'capital.common.fields.expectedRepaymentPeriod' as const,
                              value: formatTermLabel(data.expectedRepaymentPeriodDays),
                          },
                      ]
                    : []),
                ...(data.maximumRepaymentPeriodDays
                    ? [
                          {
                              key: 'capital.common.fields.maximumRepaymentDate' as const,
                              value: maximumRepaymentPeriodDate,
                          },
                      ]
                    : []),
            ] as StructuredListItem[],
        [data, formatTermLabel, hasSingleTerm, i18n, maximumRepaymentPeriodDate]
    );

    return (
        <div className="adyen-pe-capital-offer-information">
            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} stronger>
                {i18n.get('capital.common.termsTitle')}
            </Typography>
            <StructuredList
                renderValue={val => (
                    <Typography el={TypographyElement.SPAN} stronger variant={TypographyVariant.CAPTION}>
                        {val}
                    </Typography>
                )}
                renderLabel={val => (
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                        {val}
                    </Typography>
                )}
                items={items}
            />
        </div>
    );
};
