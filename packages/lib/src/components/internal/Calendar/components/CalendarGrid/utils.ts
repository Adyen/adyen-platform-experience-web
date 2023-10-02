import classnames from 'classnames';
import { JSX } from 'preact';
import { EMPTY_OBJECT, toString } from '@src/utils/common';

const EXCESS_WHITESPACE_CHAR = /^\s+|\s+(?=\s|$)/g;

export const parseClassName = (fallbackClassName: string, className: JSX.Signalish<string | undefined>): undefined | string => {
    const classes = className ? (typeof className === 'string' ? className : className?.value ?? '') : '';
    return classes.replace(EXCESS_WHITESPACE_CHAR, '') || fallbackClassName.replace(EXCESS_WHITESPACE_CHAR, '') || undefined;
};

export const getClassName = (
    className?: JSX.Signalish<string | undefined>,
    fallbackClassName?: JSX.Signalish<string | undefined>,
    requiredClassName?: JSX.Signalish<string | undefined>
) => classnames(parseClassName('', requiredClassName), parseClassName(parseClassName('', fallbackClassName) || '', className));

type PropertyDescriptor<T = any> = {
    configurable?: boolean;
    enumerable?: boolean;
    value?: T;
    writable?: boolean;
    get?(): T | undefined;
    set?(v?: T): void;
};

type PropertyFactory = {
    <T = any>(setter?: false | ((value?: T) => T | undefined), value?: T): PropertyDescriptor<T>;
    is: (value: any) => value is PropertyDescriptor;
    isObject: (value: any) => value is Record<any, any>;
    immutable: <T = any>(value?: T) => PropertyDescriptor<T>;
    mutable: <T = any>(value?: T) => PropertyDescriptor<T>;
    restricted: () => PropertyDescriptor<undefined>;
};

export const property = (() => {
    const descriptor = <T>(descriptor: PropertyDescriptor<T>) =>
        Object.freeze(
            Object.create(EMPTY_OBJECT, Object.fromEntries(Object.entries(descriptor).map(([field, value]) => [field, { value }])))
        ) as PropertyDescriptor<T>;

    const isPropDescriptor = (value: any): value is PropertyDescriptor => {
        try {
            return Object.getPrototypeOf(value) === EMPTY_OBJECT;
        } catch {
            return false;
        }
    };

    const prop = <T = any>(setter?: false | ((value?: T) => T | undefined), value?: T) => {
        if (!setter)
            return descriptor({
                enumerable: true,
                writable: setter !== false,
                value,
            });

        let currentValue = value;

        return descriptor({
            enumerable: true,
            get: () => currentValue,
            set: (value?: T) => {
                currentValue = setter(value);
            },
        });
    };

    return Object.defineProperties(prop, {
        is: { value: isPropDescriptor },
        isObject: { value: (value: any): value is Record<any, any> => toString(value).slice(8, -1) === 'Object' },
        immutable: { value: <T = any>(value?: T) => prop(false, value) },
        mutable: { value: <T = any>(value?: T) => prop(undefined, value) },
        restricted: { value: () => prop<undefined>(false) },
    }) as PropertyFactory;
})();

export const propsProperty = (() => {
    type UnwrappedProps<T extends Record<string, any>> = {
        [K in keyof T]:
            | (T[K] extends PropertyDescriptor<infer U> ? (U extends Record<string, any> ? UnwrappedProps<U> : U) : T[K])
            | PropertyDescriptor<T[K]>;
    } & Record<string, any>;

    const propsProperty = <T extends Record<string, any> = {}>(props = {} as UnwrappedProps<T>, deepImmutable = false) => {
        const $props = Object.create(null) as UnwrappedProps<T>;

        for (const [prop, maybeDescriptor] of Object.entries<UnwrappedProps<T>[keyof T]>(props)) {
            try {
                const isDescriptor = property.is(maybeDescriptor);
                const isPlainObject = property.isObject(maybeDescriptor);

                if (isDescriptor || isPlainObject) {
                    Object.defineProperty($props, prop, isDescriptor ? maybeDescriptor : propsProperty(maybeDescriptor, deepImmutable));
                    continue;
                } else if (deepImmutable) {
                    Object.defineProperty($props, prop, property.immutable(maybeDescriptor));
                    continue;
                }
            } catch {
                /* no empty catch block */
            }

            $props[prop as keyof T] = maybeDescriptor;
        }

        return property((props = {} as UnwrappedProps<T>) => Object.assign($props, props), $props);
    };

    const unwrapped = <T extends Record<string, any> = {}>(props = {} as UnwrappedProps<T>, deepImmutable = false) => {
        const P = propsProperty(props, deepImmutable);
        return Object.create(null, { P }).P as T;
    };

    return Object.defineProperties(propsProperty, {
        unwrapped: { value: unwrapped },
    }) as {
        <T extends Record<string, any> = {}>(props?: UnwrappedProps<T>, deepImmutable?: boolean): PropertyDescriptor<UnwrappedProps<T>>;
        unwrapped: <T extends Record<string, any> = {}>(props?: UnwrappedProps<T>, deepImmutable?: boolean) => T;
    };
})();
