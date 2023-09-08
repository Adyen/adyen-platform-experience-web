import { memo } from 'preact/compat';
import { CalendarControlsProps } from './types';
import calendar from '../../calendar';
import memoComparator from '@src/utils/memoComparator';

const CalendarControls = ({ config, grid: { controls }, renderer }: CalendarControlsProps) => {
    if (config.controls === calendar.controls.NONE || typeof renderer !== 'function') return null;
    return <>{controls.map(([control, handle]) => renderer(control, handle))}</>;
};

export default memo(
    CalendarControls,
    memoComparator({
        config: value => value?.controls,
    })
);
