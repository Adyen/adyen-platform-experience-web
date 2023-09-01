import { CONTROLS_ALL, CONTROLS_MINIMAL, CONTROLS_NONE, SHIFT_BLOCK, SHIFT_FRAME, SHIFT_PERIOD } from '../constants';
import { TimeFrame } from '@src/components/internal/Calendar/calendar/archive/internal/timeframe';
import indexed from '../shared/indexed';
import { enumerable } from '../shared/utils';
import {
    CalendarConfigurator,
    CalendarGrid,
    CalendarGridControlEntry,
    CalendarGridControls,
    CalendarShiftControl,
    CalendarShiftControlFlag,
    CalendarShiftControlsFlag,
} from '../types';
import { InteractionKeyCode } from '@src/components/types';

const getCalendarControls = (() => {
    const ALL_CONTROLS = Object.keys(CalendarShiftControlsFlag).filter(control => isNaN(+control)) as CalendarShiftControl[];
    const MINIMAL_CONTROLS = ['PREV', 'NEXT'] as CalendarShiftControl[];
    const ACTIVATION_KEYS = [InteractionKeyCode.ENTER, InteractionKeyCode.SPACE] as const;

    const determineShiftCapability = (shiftDirection: 1 | -1, frame?: TimeFrame) =>
        !!frame && !(shiftDirection > 0 ? frame.isAtEnd : frame.isAtStart);

    const getShiftFactorFromEvent = (configurator: CalendarConfigurator, target: CalendarShiftControl, evt?: Event): number | undefined => {
        if (!(configurator.frame && typeof configurator.configure.watch === 'function')) return;

        if (evt instanceof MouseEvent) {
            if (evt.type !== 'click') return;
        } else if (evt instanceof KeyboardEvent) {
            if (!ACTIVATION_KEYS.includes(evt.code as (typeof ACTIVATION_KEYS)[number])) return;
        } else return;

        let shiftFactor = 1;

        if (typeof configurator.configure.shiftFactor === 'function') {
            const factor = Number(configurator.configure.shiftFactor.call(configurator.config, evt, target));
            shiftFactor = Number.isInteger(factor) && factor >= 1 ? factor : shiftFactor;
        }

        return shiftFactor;
    };

    const getUnitShiftOffset = (flags: number) => (flags & CalendarShiftControlFlag.PREV ? -1 : 1);

    const getShiftType = (flags: number) => {
        switch (flags & ~CalendarShiftControlFlag.PREV) {
            case CalendarShiftControlFlag.FRAME:
                return SHIFT_FRAME;
            case CalendarShiftControlFlag.PERIOD:
                return SHIFT_PERIOD;
            case CalendarShiftControlFlag.BLOCK:
            default:
                return SHIFT_BLOCK;
        }
    };

    const factory = (configurator: CalendarConfigurator, controls: CalendarShiftControl[] = []) => {
        const controlDescriptors = {} as {
            [P in CalendarShiftControl]: {
                enumerable: true;
                value: Exclude<CalendarGridControls[P], undefined>;
            };
        };

        for (const control of controls) {
            const flags = CalendarShiftControlsFlag[control];
            const shiftType = getShiftType(flags);
            const unitOffset = getUnitShiftOffset(flags);

            controlDescriptors[control] = enumerable((...args: any[]) => {
                const canShift = determineShiftCapability(unitOffset, configurator.frame);
                if (!(canShift && args.length)) return canShift;

                const shiftFactor = getShiftFactorFromEvent(configurator, control, args[0] as Event);
                if (shiftFactor === undefined) return false;

                configurator.frame?.shiftFrame(unitOffset * shiftFactor, shiftType);
                return true;
            });
        }

        return indexed<CalendarGridControlEntry, CalendarGridControls>(
            {
                ...controlDescriptors,
                length: { value: controls.length },
            },
            index => {
                const control = controls[index] as CalendarShiftControl;
                return [control, controlDescriptors[control].value];
            }
        ) satisfies CalendarGrid['controls'];
    };

    return (configurator: CalendarConfigurator) => {
        switch (configurator.config.controls) {
            case CONTROLS_ALL:
                return factory(configurator, ALL_CONTROLS);
            case CONTROLS_MINIMAL:
                return factory(configurator, MINIMAL_CONTROLS);
            case CONTROLS_NONE:
            default:
                return factory(configurator);
        }
    };
})();

export default getCalendarControls;
