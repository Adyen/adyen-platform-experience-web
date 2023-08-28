import { memo } from 'preact/compat';
import { CalendarControlsProps } from './types';

function CalendarControls({ grid: { controls }, renderControl }: CalendarControlsProps) {
    if (!renderControl) return null;
    return <>{[...controls.map(([control, handle]) => renderControl(control, handle))]}</>;
}

export default memo(CalendarControls, ({ config: prev }, { config: next }) => prev.controls === next.controls);
