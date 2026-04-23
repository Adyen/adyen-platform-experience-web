type _GetterPropertyDescriptorProps = 'enumerable' | 'get';
type _ValuePropertyDescriptorProps = 'enumerable' | 'value' | 'writable';

type _PropertyDescriptor<T extends TypedPropertyDescriptor<any>, Props extends keyof T> = Pick<
    { [K in Props]: K extends 'value' ? T[K] : NonNullable<T[K]> },
    Props
>;

export type GetterPropertyDescriptor<T> = _PropertyDescriptor<TypedPropertyDescriptor<T>, _GetterPropertyDescriptorProps>;
export type ValuePropertyDescriptor<T> = _PropertyDescriptor<TypedPropertyDescriptor<T>, _ValuePropertyDescriptorProps>;

// [TODO]: Make available when TS version has been updated
// export type WithGetSetProperty<GetValue = any, SetValue = GetValue> = {
//     get _(): GetValue;
//     set _(value: SetValue);
// };
