import { CalendarIterable, CalendarMapIteratorFactory } from '../types.old';

const createCalendarIterable = (() => {
    const mapIteratorFactory: CalendarMapIteratorFactory<any> = function* (callback = x => x, thisArg) {
        for (let i = 0; i < this.size; i++) {
            yield callback.call(thisArg, this[i], i, this);
        }
    };

    const IterablePrototype = Object.freeze(
        Object.create(null, {
            [Symbol.iterator]: {
                value(this: CalendarIterable<any>) {
                    return this.map();
                },
            },
            map: { value: mapIteratorFactory },
        })
    );

    const ProxyGetTrap =
        <V>(getter: (index: number) => V) =>
        (target: CalendarIterable<V>, property: string | symbol, receiver: any) => {
            if (typeof property === 'string') {
                const index = +property;
                if (index >= 0 && index < target.size) {
                    return getter(index);
                }
            }
            return Reflect.get(target, property, receiver);
        };

    const ProxySetTrap = () => false;

    return <V, T extends CalendarIterable<V> = CalendarIterable<V>>(
        iterablePropertyDescriptorsOrSize: (PropertyDescriptorMap & ThisType<T>) | (() => number) | number,
        iteratorValueGetter: (index: number) => V
    ): T => {
        if (typeof iterablePropertyDescriptorsOrSize === 'function') {
            return createCalendarIterable<V, T>(
                {
                    size: { get: iterablePropertyDescriptorsOrSize },
                },
                iteratorValueGetter
            );
        }

        if (typeof iterablePropertyDescriptorsOrSize === 'number') {
            return createCalendarIterable<V, T>(
                {
                    size: { value: iterablePropertyDescriptorsOrSize },
                },
                iteratorValueGetter
            );
        }

        return new Proxy(Object.create(IterablePrototype, iterablePropertyDescriptorsOrSize) as T, {
            get: ProxyGetTrap(iteratorValueGetter),
            set: ProxySetTrap,
        }) as T;
    };
})();

export default createCalendarIterable;
