import classNames from 'classnames';

const getModifierClasses = (prefix?: string, modifiers: string[] = [], baseClasses: any[] = []) =>
    classNames([...baseClasses, ...modifiers?.map(m => (prefix ? `${prefix}--${m}` : m))]);

export default getModifierClasses;
