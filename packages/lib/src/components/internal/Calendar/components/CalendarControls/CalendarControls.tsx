import { ComponentChild } from 'preact';
import { memo } from 'preact/compat';
import { CalendarControlsProps } from './types';
import useTraversalControls, { TraversalControls } from '../../hooks/useTraversalControls';
import { CalendarTraversalControlRootProps } from '../../types';

function CalendarControls({ controls, grid, renderControl }: CalendarControlsProps) {
    if (!renderControl) return null;

    const traversalControls = useTraversalControls(grid, renderControl, controls);

    return (
        <>
            {([] as ComponentChild[]).concat(
                TraversalControls.map(traversal => renderControl(traversal, traversalControls[traversal] as CalendarTraversalControlRootProps))
            )}
        </>
    );
}

export default memo(CalendarControls);
