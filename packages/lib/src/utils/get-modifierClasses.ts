import classNames from 'classnames';

const getModifierClasses = (classes: string, prefix: string, modifiers: string[] | undefined) =>
    modifiers ? classNames([classes, ...modifiers.map(m => (prefix ? `${prefix}-${m}` : m))]) : classes;

export default getModifierClasses;
