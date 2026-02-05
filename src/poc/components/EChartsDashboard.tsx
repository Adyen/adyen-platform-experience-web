import { useEffect, useMemo, useRef } from 'preact/hooks';
import * as echarts from 'echarts';
import type { EChartsOption, TooltipComponentFormatterCallbackParams } from 'echarts';
import Card from '../../components/internal/Card/Card';
import { financialData } from '../mocks/financialData';

const CHART_HEIGHT = 320;
const COLORS = {
    blocked: '#f97316',
    refused: '#ef4444',
    revenue: '#2563eb',
} as const;

const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams): string => {
    // RISK: ECharts string-based tooltips bypass React's XSS protections.
    const items = Array.isArray(params) ? params : [params];
    const firstItem = items[0] as { axisValueLabel?: string; axisValue?: string; name?: string } | undefined;
    const title = firstItem?.axisValueLabel ?? firstItem?.axisValue ?? firstItem?.name ?? '';
    const rows = items
        .map(item => {
            const value = Array.isArray(item.value) ? item.value.join(', ') : item.value;
            return `<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
                <span>${item.marker} ${item.seriesName}</span>
                <strong>${value ?? ''}</strong>
            </div>`;
        })
        .join('');

    return `<div style="min-width:140px;">
        <div style="font-weight:600;margin-bottom:6px;">${title}</div>
        ${rows}
    </div>`;
};

const EChartsDashboard = () => {
    const chartRef = useRef<HTMLDivElement | null>(null);

    const chartOptions = useMemo<EChartsOption>(() => {
        const months = financialData.map(({ month }) => month);
        const blocked = financialData.map(({ blocked }) => blocked);
        const refused = financialData.map(({ refused }) => refused);
        const revenue = financialData.map(({ realized, projected }) => (realized ?? 0) + (projected ?? 0));

        return {
            tooltip: {
                trigger: 'axis',
                formatter: tooltipFormatter,
            },
            legend: {
                data: ['Blocked', 'Refused', 'Revenue'],
                bottom: 0,
            },
            grid: {
                left: 48,
                right: 24,
                top: 24,
                bottom: 48,
            },
            xAxis: {
                type: 'category',
                data: months,
            },
            yAxis: {
                type: 'value',
            },
            series: [
                {
                    name: 'Blocked',
                    type: 'bar',
                    data: blocked,
                    itemStyle: { color: COLORS.blocked },
                },
                {
                    name: 'Refused',
                    type: 'bar',
                    data: refused,
                    itemStyle: { color: COLORS.refused },
                },
                {
                    name: 'Revenue',
                    type: 'line',
                    data: revenue,
                    smooth: true,
                    lineStyle: { width: 3, color: COLORS.revenue },
                },
            ],
        };
    }, []);

    useEffect(() => {
        if (!chartRef.current) {
            return;
        }

        const chart = echarts.init(chartRef.current, undefined, { renderer: 'canvas' });
        chart.setOption(chartOptions);

        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.dispose();
        };
    }, [chartOptions]);

    return (
        <Card title="ECharts mixed chart" subTitle="">
            <div ref={chartRef} style={{ width: '100%', height: CHART_HEIGHT }} />
        </Card>
    );
};

export default EChartsDashboard;
