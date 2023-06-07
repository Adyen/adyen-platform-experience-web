import { NamedRefCallback, NamedRefEffect, NamedRefRecord } from '../types';

const effectsQueue = new Set<NamedRefEffect>();
const references = new Map<string, NamedRefRecord>();

let raf: number | undefined;

const getReferenceFromIdentifier = (identifier: string) => {
    const reference = references.get(identifier);
    if (!reference) throw new ReferenceError('Missing reference');
    return reference;
};

export const attachCallback = <T = any>(identifier: string, callback: NamedRefCallback<T>) => {
    const [, , callbacks] = getReferenceFromIdentifier(identifier);
    callbacks.set(callback, (callbacks.get(callback) || 0) + 1);
};

export const detachCallback = <T = any>(identifier: string, callback: NamedRefCallback<T>) => {
    const [, , callbacks] = getReferenceFromIdentifier(identifier);
    const instances = callbacks.get(callback) || 0;

    if (instances > 1) callbacks.set(callback, instances - 1);
    else if (instances === 1) callbacks.delete(callback);
};

export const queueEffect = (effect: NamedRefEffect) => {
    effectsQueue.add(effect);
    cancelAnimationFrame(raf as number);

    raf = requestAnimationFrame(() => {
        for (const effect of effectsQueue) effect();
        effectsQueue.clear();
        raf = undefined;
    });
};

export const createRefMapping = <T = any>(identifier: string, effect?: NamedRefEffect) => {
    let reference = references.get(identifier);

    if (!reference) {
        reference = [null, new Set<NamedRefEffect>(), new Map<NamedRefCallback<T>, number>()];
        references.set(identifier, reference);
    }

    const effects = reference[1];

    if (effect && effects.size !== effects.add(effect).size) {
        queueEffect(effect);
    }

    return reference;
};
