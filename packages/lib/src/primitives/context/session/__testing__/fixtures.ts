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
    patchSpecification: <T extends keyof SessionSpecification<any>>(field: T, value: SessionSpecification<any>[T]) => void;
    resetSpecification: () => void;
};

export const augmentSessionRefreshContext = <T extends SessionRefreshContext>(ctx: T) => {
    augmentSpecificationContext(ctx);
    ctx._emitter = createEventEmitter();
    ctx.expireSession = () => ctx._emitter.emit(EVT_SESSION_EXPIRED);
    ctx.refresher = createSessionRefresher(ctx._emitter, ctx._specification);
};

export const augmentSpecificationContext = <T extends SpecificationContext>(ctx: T) => {
    const _patches: (() => void)[] = [];

    ctx._specification = { onRefresh: () => {} };

    ctx.patchSpecification = <T extends keyof typeof ctx._specification>(field: T, value: (typeof ctx._specification)[T]) => {
        [ctx._specification[field], value] = [value, ctx._specification[field]];
        _patches.push(() => void (ctx._specification[field] = value));
    };

    ctx.resetSpecification = () => {
        while (_patches.length) {
            const unpatch = _patches.pop();
            unpatch && unpatch();
        }
    };
};
