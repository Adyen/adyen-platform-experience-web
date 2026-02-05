import { useMemo, useState } from 'preact/hooks';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { BarGroup, LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { TooltipWithBounds, useTooltip, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import Card from '../../components/internal/Card/Card';
import { financialData, FinancialDataPoint } from '../mocks/financialData';

const CHART_HEIGHT = 320;
const MARGIN = { top: 24, right: 24, bottom: 48, left: 56 };
const Y_TICKS = [0, 30000, 60000, 90000, 120000, 150000, 180000, 210000];
const Y_MAX = 210000;

type BarKey = 'blocked' | 'refused';
const BAR_KEYS: BarKey[] = ['blocked', 'refused'];

const COLORS = {
    grid: '#e2e8f0',
    axis: '#cbd5e1',
    axisLabel: '#64748b',
    line: '#2563eb',
    blocked: '#f97316',
    refused: '#ef4444',
    crosshair: '#94a3b8',
} as const;

interface TooltipData {
    month: string;
    blocked: number;
    refused: number;
    realized: number | null;
    projected: number | null;
    revenue: number;
}

interface BarGroupShape {
    index: number;
    x0: number | null;
    bars: Array<{
        index: number;
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
    }>;
}

const tooltipStyles = {
    ...defaultStyles,
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    border: '1px solid #1e293b',
    borderRadius: 8,
    padding: '8px 10px',
};

const formatValue = (value: number | null) => (value === null ? '-' : value.toLocaleString('en-US'));

const getRevenue = (datum: FinancialDataPoint) => (datum.realized ?? 0) + (datum.projected ?? 0);

const VisxDashboard = () => {
    // SECURITY: Visx uses standard Preact VDOM, inheriting all XSS sanitization and Design System context.
    const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } = useTooltip<TooltipData>();
    const [crosshairX, setCrosshairX] = useState<number | null>(null);

    return (
        <Card title="Visx mixed chart" subTitle="">
            <div style={{ width: '100%', height: CHART_HEIGHT, position: 'relative' }}>
                <ParentSize>
                    {({ width, height }: { width: number; height: number }) => {
                        if (width < 10 || height < 10) {
                            return null;
                        }

                        const innerWidth = width - MARGIN.left - MARGIN.right;
                        const innerHeight = height - MARGIN.top - MARGIN.bottom;
                        const months = financialData.map(datum => datum.month);

                        const x0Scale = scaleBand<string>({
                            domain: months,
                            padding: 0.2,
                            range: [0, innerWidth],
                        });

                        const x1Scale = scaleBand<BarKey>({
                            domain: BAR_KEYS,
                            padding: 0.1,
                            range: [0, x0Scale.bandwidth()],
                        });

                        const yScale = scaleLinear<number>({
                            domain: [0, Y_MAX],
                            range: [innerHeight, 0],
                        });

                        const getPointX = (month: string) => (x0Scale(month) ?? 0) + x0Scale.bandwidth() / 2;

                        const handleTooltip = (event: MouseEvent | TouchEvent, datum: FinancialDataPoint) => {
                            const point = localPoint(event);
                            if (!point) {
                                return;
                            }

                            const barX = x0Scale(datum.month) ?? 0;
                            const centerX = barX + x0Scale.bandwidth() / 2;
                            setCrosshairX(centerX);

                            showTooltip({
                                tooltipLeft: point.x,
                                tooltipTop: point.y,
                                tooltipData: {
                                    month: datum.month,
                                    blocked: datum.blocked,
                                    refused: datum.refused,
                                    realized: datum.realized,
                                    projected: datum.projected,
                                    revenue: getRevenue(datum),
                                },
                            });
                        };

                        const handleMouseLeave = () => {
                            setCrosshairX(null);
                            hideTooltip();
                        };

                        return (
                            <svg width={width} height={height}>
                                <Group left={MARGIN.left} top={MARGIN.top}>
                                    {Y_TICKS.map(tick => (
                                        <line
                                            key={`grid-row-${tick}`}
                                            x1={0}
                                            x2={innerWidth}
                                            y1={yScale(tick)}
                                            y2={yScale(tick)}
                                            stroke={COLORS.grid}
                                            strokeWidth={1}
                                            opacity={0.6}
                                        />
                                    ))}

                                    <BarGroup
                                        data={financialData}
                                        keys={BAR_KEYS}
                                        height={innerHeight}
                                        x0={(datum: FinancialDataPoint) => datum.month}
                                        x0Scale={x0Scale}
                                        x1Scale={x1Scale}
                                        yScale={yScale}
                                        color={(key: BarKey) => (key === 'blocked' ? COLORS.blocked : COLORS.refused)}
                                    >
                                        {(barGroups: BarGroupShape[]) =>
                                            barGroups.map((barGroup: BarGroupShape) => (
                                                <Group key={`bar-group-${barGroup.index}`} left={barGroup.x0 ?? 0} top={0}>
                                                    {barGroup.bars.map((bar: BarGroupShape['bars'][number]) => (
                                                        <rect
                                                            key={`bar-${barGroup.index}-${bar.index}`}
                                                            x={bar.x}
                                                            y={bar.y}
                                                            width={bar.width}
                                                            height={bar.height}
                                                            fill={bar.color}
                                                        />
                                                    ))}
                                                </Group>
                                            ))
                                        }
                                    </BarGroup>

                                    <LinePath
                                        data={financialData}
                                        x={(datum: FinancialDataPoint) => getPointX(datum.month)}
                                        y={(datum: FinancialDataPoint) => yScale(getRevenue(datum))}
                                        curve={curveMonotoneX}
                                        stroke={COLORS.line}
                                        strokeWidth={3}
                                    />

                                    {financialData.map(datum => (
                                        <circle
                                            key={`point-${datum.month}`}
                                            cx={getPointX(datum.month)}
                                            cy={yScale(getRevenue(datum))}
                                            r={3.5}
                                            fill="#ffffff"
                                            stroke={COLORS.line}
                                            strokeWidth={2}
                                        />
                                    ))}

                                    {crosshairX !== null && (
                                        <line
                                            x1={crosshairX}
                                            x2={crosshairX}
                                            y1={0}
                                            y2={innerHeight}
                                            stroke={COLORS.crosshair}
                                            strokeWidth={1}
                                            strokeDasharray="4 4"
                                            pointerEvents="none"
                                        />
                                    )}

                                    {financialData.map(datum => (
                                        <rect
                                            key={`overlay-${datum.month}`}
                                            x={x0Scale(datum.month)}
                                            y={0}
                                            width={x0Scale.bandwidth()}
                                            height={innerHeight}
                                            fill="transparent"
                                            onMouseMove={event => handleTooltip(event, datum)}
                                            onMouseLeave={handleMouseLeave}
                                            onTouchMove={event => handleTooltip(event, datum)}
                                            onTouchEnd={handleMouseLeave}
                                        />
                                    ))}

                                    <AxisLeft
                                        scale={yScale}
                                        tickValues={Y_TICKS}
                                        tickFormat={value => `${Number(value) / 1000}k`}
                                        tickLabelProps={() => ({ fill: COLORS.axisLabel, fontSize: 11 })}
                                        stroke={COLORS.axis}
                                        tickStroke={COLORS.axis}
                                    />
                                    <AxisBottom
                                        top={innerHeight}
                                        scale={x0Scale}
                                        tickLabelProps={() => ({ fill: COLORS.axisLabel, fontSize: 11 })}
                                        stroke={COLORS.axis}
                                        tickStroke={COLORS.axis}
                                    />
                                </Group>
                                <Group left={MARGIN.left} top={MARGIN.top + innerHeight + 28}>
                                    <Group left={0} top={0}>
                                        <rect width={18} height={10} rx={2} fill={COLORS.blocked} />
                                        <text x={24} y={9} fill={COLORS.axisLabel} fontSize={12}>
                                            Blocked
                                        </text>
                                    </Group>
                                    <Group left={96} top={0}>
                                        <rect width={18} height={10} rx={2} fill={COLORS.refused} />
                                        <text x={24} y={9} fill={COLORS.axisLabel} fontSize={12}>
                                            Refused
                                        </text>
                                    </Group>
                                    <Group left={176} top={0}>
                                        <line x1={0} x2={18} y1={5} y2={5} stroke={COLORS.line} strokeWidth={2} />
                                        <circle cx={9} cy={5} r={3} fill="#ffffff" stroke={COLORS.line} strokeWidth={2} />
                                        <text x={24} y={9} fill={COLORS.axisLabel} fontSize={12}>
                                            Revenue
                                        </text>
                                    </Group>
                                </Group>
                            </svg>
                        );
                    }}
                </ParentSize>

                {tooltipData && (
                    <TooltipWithBounds top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{tooltipData.month}</div>
                        <div>Blocked: {tooltipData.blocked.toLocaleString('en-US')}</div>
                        <div>Refused: {tooltipData.refused.toLocaleString('en-US')}</div>
                        <div>Realized: {formatValue(tooltipData.realized)}</div>
                        <div>Projected: {formatValue(tooltipData.projected)}</div>
                        <div>Revenue: {tooltipData.revenue.toLocaleString('en-US')}</div>
                    </TooltipWithBounds>
                )}
            </div>
        </Card>
    );
};

export default VisxDashboard;
