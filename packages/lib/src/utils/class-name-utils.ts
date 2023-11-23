import classnames from 'classnames';
import { JSX } from 'preact';

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

export const getModifierClasses = (prefix: string, modifiers: string[] = [], baseClasses: string[] = []): string =>
    classnames([...baseClasses, ...modifiers?.map(m => (prefix ? `${prefix}--${m}` : m))]);
