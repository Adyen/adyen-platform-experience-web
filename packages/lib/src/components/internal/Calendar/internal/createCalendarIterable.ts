import { CalendarIterable, CalendarMapIteratorFactory } from '../types';

const createCalendarIterable = (() => {
    const mapIteratorFactory: CalendarMapIteratorFactory<any> = function* (callback = x => x, thisArg) {
        for (let i = this.offset; i < this.size; i++) {
            yield callback.call(thisArg, this[i], i, this);
        }
    };

    const IterablePrototype = Object.freeze(Object.create(null, {
        [Symbol.iterator]: { value(this: CalendarIterable<any>) { return this.map(); }},
        map: { value: mapIteratorFactory }
    }));

    const ProxyGetTrap = <V>(getter: (index: number) => V) =>
        (target: CalendarIterable<V>, property: string | symbol, receiver: any) => {
            if (typeof property === 'string') {
                const index = +property;
                if (index >= target.offset && index < target.size) {
                    return getter(index);
                }
            }
            return Reflect.get(target, property, receiver);
        };

    const ProxySetTrap = () => false;

    return <V, T extends CalendarIterable<V> = CalendarIterable<V>>(
        iterablePropertyDescriptors: PropertyDescriptorMap & ThisType<T>,
        iteratorValueGetter: (index: number) => V
    ) => new Proxy(Object.create(IterablePrototype, iterablePropertyDescriptors) as T, {
        get: ProxyGetTrap(iteratorValueGetter),
        set: ProxySetTrap
    }) as T;
})();

export default createCalendarIterable;
