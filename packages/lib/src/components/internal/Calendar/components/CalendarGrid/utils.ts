import { JSX } from 'preact';
import { CalendarFlag } from '@src/components/internal/Calendar/types';

const EXCESS_WHITESPACE_CHARS = /^\s+|\s+(?=\s|$)/g;

export const withFlag = (flags: number, flag: CalendarFlag): 1 | undefined => (flags & flag ? 1 : undefined);

export const parseClassName = (fallbackClassName: string, className: JSX.Signalish<string | undefined>): undefined | string => {
    const classes = className ? (typeof className === 'string' ? className : className?.value ?? '') : '';
    return classes.replace(EXCESS_WHITESPACE_CHARS, '') || fallbackClassName.replace(EXCESS_WHITESPACE_CHARS, '') || undefined;
};
