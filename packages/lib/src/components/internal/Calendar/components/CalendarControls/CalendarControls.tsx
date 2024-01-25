import { memo } from 'preact/compat';
import { CalendarControlsProps } from './types';
import calendar from '../../calendar';
import { isFunction } from '@src/utils/common';

const CalendarControls = ({ config, grid: { controls }, renderer }: CalendarControlsProps) => {
    if (config.controls === calendar.controls.NONE || !isFunction(renderer)) return null;
    return <>{controls.map(([control, handle]) => renderer(control, handle))}</>;
};

export default memo(CalendarControls);
