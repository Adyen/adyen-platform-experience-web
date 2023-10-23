import classNames from 'classnames';

const getModifierClasses = (prefix: string, modifiers?: string[], baseClasses?: string) =>
    modifiers ? classNames([baseClasses ? baseClasses : [], ...modifiers?.map(m => (prefix ? `${prefix}--${m}` : m))]) : baseClasses;

export default getModifierClasses;
