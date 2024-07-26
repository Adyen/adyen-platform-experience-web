import createSessionRefresher from '../internal/refresher';
import { createEventEmitter } from '../../../reactive/eventEmitter';
import { EVT_SESSION_EXPIRED } from '../constants';
import type { SessionEventType, SessionSpecification } from '../types';

export type SessionRefreshContext = SpecificationContext & {
    _emitter: ReturnType<typeof createEventEmitter<SessionEventType>>;
    expireSession: () => void;
    refresher: ReturnType<typeof createSessionRefresher>;
};

export type SpecificationContext = {
    _specification: SessionSpecification<any>;
    patchSpecification: <T extends keyof SessionSpecification<any>>(
        field: T,
        getNextValue: (currentValue: SessionSpecification<any>[T]) => SessionSpecification<any>[T]
    ) => void;
    resetSpecification: <T extends keyof SessionSpecification<any>>(...fields: T[]) => void;
};

export const augmentSessionRefreshContext = <T extends SessionRefreshContext>(ctx: T) => {
    augmentSpecificationContext(ctx);
    ctx._emitter = createEventEmitter();
    ctx.expireSession = () => ctx._emitter.emit(EVT_SESSION_EXPIRED);
    ctx.refresher = createSessionRefresher(ctx._emitter, ctx._specification);
};

export const augmentSpecificationContext = <T extends SpecificationContext>(ctx: T) => {
    const _patchMap = new Map<T, (() => void)[]>();

    ctx._specification = { onRefresh: () => {} };

    ctx.patchSpecification = (field, getNextValue) => {
        let nextValue = getNextValue(ctx._specification[field]);
        let patches = _patchMap.get(field as unknown as T);
        if (patches === undefined) _patchMap.set(field as unknown as T, (patches = []));

        [ctx._specification[field], nextValue] = [nextValue, ctx._specification[field]];
        patches.push(() => void (ctx._specification[field] = nextValue));
    };

    ctx.resetSpecification = (...fields) => {
        for (const field of fields.length === 0 ? _patchMap.keys() : fields) {
            const patches = _patchMap.get(field as unknown as T);
            if (patches === undefined) continue;
            while (patches.length) {
                const unpatch = patches.pop();
                unpatch && unpatch();
            }
            _patchMap.delete(field as unknown as T);
        }
    };
};
