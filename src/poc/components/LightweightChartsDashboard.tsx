import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
    ColorType,
    CrosshairMode,
    LineSeries,
    LineStyle,
    LineType,
    createChart,
    customSeriesDefaultOptions,
    type AutoscaleInfoProvider,
    type CustomData,
    type CustomSeriesPricePlotValues,
    type CustomSeriesWhitespaceData,
    type ICustomSeriesPaneRenderer,
    type ICustomSeriesPaneView,
    type LineData,
    type MouseEventParams,
    type PaneRendererCustomData,
    type PriceToCoordinateConverter,
    type Time,
} from 'lightweight-charts';
import Card from '../../components/internal/Card/Card';
import { financialData, FinancialDataPoint } from '../mocks/financialData';

const CHART_HEIGHT = 320;
const TOOLTIP_WIDTH = 180;
const TOOLTIP_HEIGHT = 128;
const Y_MAX = 210000;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const COLORS = {
    grid: '#e2e8f0',
    axis: '#cbd5e1',
    axisLabel: '#64748b',
    line: '#2563eb',
    blocked: '#f97316',
    refused: '#ef4444',
    crosshair: '#94a3b8',
    tooltipBackground: '#ffffff',
    tooltipBorder: '#cbd5e1',
    tooltipText: '#0f172a',
} as const;

interface TooltipState {
    left: number;
    top: number;
    month: string;
    blocked: number;
    refused: number;
    realized: number | null;
    projected: number | null;
    revenue: number;
}

type CanvasTarget = Parameters<ICustomSeriesPaneRenderer['draw']>[0];
type MediaCoordinateScope = Parameters<Parameters<CanvasTarget['useMediaCoordinateSpace']>[0]>[0];

interface GroupedBarData extends CustomData<Time> {
    blocked: number;
    refused: number;
}

const formatValue = (value: number | null) => (value === null ? '-' : value.toLocaleString('en-US'));

const getRevenue = (datum: FinancialDataPoint) => (datum.realized ?? 0) + (datum.projected ?? 0);

const createTime = (index: number): string => `2024-${String(index + 1).padStart(2, '0')}-01`;

const formatMonth = (time: Time): string => {
    if (typeof time === 'string') {
        const parsedDate = new Date(time);

        if (!Number.isNaN(parsedDate.getTime())) {
            return parsedDate.toLocaleString('en-US', { month: 'short' });
        }

        return time;
    }

    if (typeof time === 'number') {
        return new Date(time * 1000).toLocaleString('en-US', { month: 'short' });
    }

    return MONTH_LABELS[time.month - 1] ?? '';
};

const formatTick = (value: number): string => `${Math.round(value / 1000)}k`;

const buildAutoscaleProvider =
    (maxValue: number): AutoscaleInfoProvider =>
    original => {
        const result = original();

        if (!result || !result.priceRange) {
            return result;
        }

        return {
            priceRange: {
                minValue: 0,
                maxValue: Math.max(maxValue, result.priceRange.maxValue),
            },
        };
    };

const buildTooltipPosition = (point: { x: number; y: number }, container: HTMLDivElement): { left: number; top: number } => {
    const { width, height } = container.getBoundingClientRect();
    const left = Math.min(Math.max(0, point.x + 12), width - TOOLTIP_WIDTH);
    const top = Math.min(Math.max(0, point.y - TOOLTIP_HEIGHT - 12), height - TOOLTIP_HEIGHT);

    return { left, top };
};

const drawBar = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
    if (height <= 0) {
        return;
    }

    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
};

class GroupedBarsRenderer implements ICustomSeriesPaneRenderer {
    private _data: PaneRendererCustomData<Time, GroupedBarData> | null = null;

    update(data: PaneRendererCustomData<Time, GroupedBarData>) {
        this._data = data;
    }

    draw(target: CanvasTarget, priceConverter: PriceToCoordinateConverter, _isHovered: boolean, _hitTestData?: unknown): void {
        if (!this._data) {
            return;
        }

        const { bars, barSpacing } = this._data;
        const groupWidth = Math.max(6, barSpacing * 0.65);
        const barGap = Math.max(1, groupWidth * 0.1);
        const barWidth = Math.max(2, (groupWidth - barGap) / 2);

        target.useMediaCoordinateSpace(({ context }: MediaCoordinateScope) => {
            const baseY = priceConverter(0);
            if (baseY === null) {
                return;
            }

            bars.forEach(bar => {
                const { blocked, refused } = bar.originalData;
                const blockedY = priceConverter(blocked);
                const refusedY = priceConverter(refused);
                const leftX = bar.x - groupWidth / 2;

                if (blockedY !== null) {
                    const top = Math.min(baseY, blockedY);
                    drawBar(context, leftX, top, barWidth, Math.abs(baseY - blockedY), COLORS.blocked);
                }

                if (refusedY !== null) {
                    const top = Math.min(baseY, refusedY);
                    drawBar(context, leftX + barWidth + barGap, top, barWidth, Math.abs(baseY - refusedY), COLORS.refused);
                }
            });
        });
    }
}

class GroupedBarsSeries implements ICustomSeriesPaneView<Time, GroupedBarData> {
    private _renderer = new GroupedBarsRenderer();

    renderer(): ICustomSeriesPaneRenderer {
        return this._renderer;
    }

    update(data: PaneRendererCustomData<Time, GroupedBarData>): void {
        this._renderer.update(data);
    }

    priceValueBuilder(plotRow: GroupedBarData): CustomSeriesPricePlotValues {
        const maxValue = Math.max(plotRow.blocked, plotRow.refused);

        return [maxValue, 0, maxValue];
    }

    isWhitespace(data: GroupedBarData | CustomSeriesWhitespaceData<Time>): data is CustomSeriesWhitespaceData<Time> {
        return !('blocked' in data) || !('refused' in data);
    }

    defaultOptions() {
        return customSeriesDefaultOptions;
    }
}

const LightweightChartsDashboard = () => {
    // SECURITY: Lightweight charts uses canvas rendering, avoiding direct HTML injection.
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartWrapperRef = useRef<HTMLDivElement | null>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const chartData = useMemo(() => {
        const series = financialData.map((datum, index) => ({
            time: createTime(index),
            datum,
        }));

        const barSeries = series.map(({ time, datum }) => ({
            time,
            blocked: datum.blocked,
            refused: datum.refused,
        }));

        const lineSeries = series.map(({ time, datum }) => ({
            time,
            value: getRevenue(datum),
        }));

        const lookup = new Map(series.map(({ time, datum }) => [formatMonth(time), datum]));
        const maxRevenue = Math.max(...lineSeries.map(point => point.value), Y_MAX);

        return {
            barSeries,
            lineSeries,
            lookup,
            maxRevenue,
        };
    }, []);

    useEffect(() => {
        if (!chartContainerRef.current) {
            return;
        }

        const chart = createChart(chartContainerRef.current, {
            autoSize: true,
            height: CHART_HEIGHT,
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: COLORS.axisLabel,
                fontSize: 11,
            },
            grid: {
                vertLines: { color: COLORS.grid, visible: false, style: LineStyle.Solid },
                horzLines: { color: COLORS.grid, visible: true, style: LineStyle.Solid },
            },
            leftPriceScale: {
                visible: true,
                borderVisible: true,
                borderColor: COLORS.axis,
                textColor: COLORS.axisLabel,
                scaleMargins: { top: 0.12, bottom: 0.2 },
            },
            rightPriceScale: {
                visible: false,
            },
            timeScale: {
                borderVisible: true,
                borderColor: COLORS.axis,
                barSpacing: 18,
                rightOffset: 0,
                fixLeftEdge: true,
                fixRightEdge: true,
                tickMarkFormatter: (time: Time) => formatMonth(time),
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    color: COLORS.crosshair,
                    style: LineStyle.Dashed,
                    width: 1,
                    labelVisible: false,
                    visible: true,
                },
                horzLine: {
                    color: COLORS.crosshair,
                    style: LineStyle.Dashed,
                    width: 1,
                    labelVisible: false,
                    visible: false,
                },
            },
            handleScale: {
                mouseWheel: false,
                pinch: false,
                axisDoubleClickReset: false,
                axisPressedMouseMove: false,
            },
            handleScroll: {
                mouseWheel: false,
                pressedMouseMove: false,
                horzTouchDrag: false,
                vertTouchDrag: false,
            },
            localization: {
                locale: 'en-US',
                priceFormatter: (value: number) => value.toLocaleString('en-US'),
                tickmarksPriceFormatter: (values: number[]) => values.map(value => formatTick(value)),
            },
        });

        const groupedBarsView = new GroupedBarsSeries();
        const barSeries = chart.addCustomSeries(groupedBarsView, {
            priceLineVisible: false,
            lastValueVisible: false,
            priceScaleId: 'left',
        });
        barSeries.setData(chartData.barSeries);

        const lineSeries = chart.addSeries(LineSeries, {
            color: COLORS.line,
            lineWidth: 3,
            lineType: LineType.Curved,
            pointMarkersVisible: true,
            pointMarkersRadius: 3,
            crosshairMarkerVisible: false,
            priceLineVisible: false,
            lastValueVisible: false,
            priceScaleId: 'left',
            autoscaleInfoProvider: buildAutoscaleProvider(chartData.maxRevenue),
        });
        lineSeries.setData(chartData.lineSeries);

        chart.timeScale().fitContent();

        const handleCrosshairMove = (param: MouseEventParams<Time>) => {
            if (!param.point || !param.time || !chartWrapperRef.current) {
                setTooltip(null);
                return;
            }

            const month = formatMonth(param.time);
            const totals = chartData.lookup.get(month);
            const revenuePoint = param.seriesData.get(lineSeries) as LineData<Time> | undefined;
            const barPoint = param.seriesData.get(barSeries) as GroupedBarData | undefined;

            if (!totals || !revenuePoint || !barPoint) {
                setTooltip(null);
                return;
            }

            const position = buildTooltipPosition(param.point, chartWrapperRef.current);

            setTooltip({
                left: position.left,
                top: position.top,
                month,
                blocked: barPoint.blocked,
                refused: barPoint.refused,
                realized: totals.realized,
                projected: totals.projected,
                revenue: revenuePoint.value,
            });
        };

        chart.subscribeCrosshairMove(handleCrosshairMove);

        return () => {
            chart.unsubscribeCrosshairMove(handleCrosshairMove);
            chart.remove();
        };
    }, [chartData]);

    return (
        <Card title="Lightweight charts mixed chart" subTitle="">
            <div ref={chartWrapperRef} style={{ position: 'relative' }}>
                <div ref={chartContainerRef} style={{ width: '100%', height: CHART_HEIGHT }} />
                {tooltip && (
                    <div
                        style={{
                            position: 'absolute',
                            left: tooltip.left,
                            top: tooltip.top,
                            backgroundColor: COLORS.tooltipBackground,
                            border: `1px solid ${COLORS.tooltipBorder}`,
                            borderRadius: 8,
                            boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
                            color: COLORS.tooltipText,
                            fontSize: 12,
                            padding: '10px 12px',
                            minWidth: TOOLTIP_WIDTH,
                            pointerEvents: 'none',
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>{tooltip.month}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <span>Blocked</span>
                            <strong>{tooltip.blocked.toLocaleString('en-US')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <span>Refused</span>
                            <strong>{tooltip.refused.toLocaleString('en-US')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <span>Realized</span>
                            <strong>{formatValue(tooltip.realized)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <span>Projected</span>
                            <strong>{formatValue(tooltip.projected)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <span>Revenue</span>
                            <strong>{tooltip.revenue.toLocaleString('en-US')}</strong>
                        </div>
                    </div>
                )}
            </div>
            <div
                style={{
                    display: 'flex',
                    gap: 20,
                    justifyContent: 'center',
                    marginTop: 12,
                    color: COLORS.axisLabel,
                    fontSize: 12,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                        style={{
                            display: 'inline-block',
                            width: 18,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor: COLORS.blocked,
                        }}
                    />
                    <span>Blocked</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                        style={{
                            display: 'inline-block',
                            width: 18,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor: COLORS.refused,
                        }}
                    />
                    <span>Refused</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
                        <line x1="0" y1="5" x2="18" y2="5" stroke={COLORS.line} strokeWidth="2" />
                        <circle cx="9" cy="5" r="3" fill="#ffffff" stroke={COLORS.line} strokeWidth="2" />
                    </svg>
                    <span>Revenue</span>
                </div>
            </div>
        </Card>
    );
};

export default LightweightChartsDashboard;
