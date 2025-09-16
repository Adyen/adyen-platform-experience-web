/**
 * @vitest-environment jsdom
 */
import { createContext, createRef } from 'preact';
import { MutableRef, useRef } from 'preact/hooks';
import { HTMLProps, PropsWithChildren } from 'preact/compat';
import { describe, expect, test, vi } from 'vitest';
import { render, renderHook, screen } from '@testing-library/preact';
import { useComponentHeadingElement } from './useComponentHeadingElement';
import { CoreProviderProps } from '../core/Context/types';
import { CoreContext } from '../core/Context/CoreContext';
import CoreProvider from '../core/Context/CoreProvider';

const coreProviderProps = {} as CoreProviderProps;

const ComponentRoot = ({ children }: PropsWithChildren) => <CoreProvider {...coreProviderProps}>{children}</CoreProvider>;

const Heading = ({ id, ...props }: HTMLProps<any>) => {
    const { id: uniqueId, ref: headingRef } = useComponentHeadingElement<HTMLDivElement>();
    return <div {...props} id={id ?? uniqueId} ref={headingRef} />;
};

vi.mock(import('../core/Context/CoreContext'), () => {
    const componentRef = createRef() as MutableRef<HTMLDivElement | null>;
    const mockedCoreContext = createContext({ componentRef } as any);
    return { CoreContext: mockedCoreContext };
});

vi.mock(import('../core/Context/CoreProvider'), () => {
    const mockedCoreProvider = ({ children }: PropsWithChildren) => {
        const componentRef = useRef<HTMLDivElement | null>(null);
        return (
            <CoreContext.Provider value={{ componentRef } as any}>
                <section data-testid="root" ref={componentRef}>
                    {children}
                </section>
            </CoreContext.Provider>
        );
    };

    return { default: mockedCoreProvider };
});

describe('useComponentHeadingElement', () => {
    test('should return a unique heading element id for every initial render', () => {
        const uniqueIds: string[] = [];

        for (let i = 0; i < 3; i++) {
            const { result } = renderHook(() => useComponentHeadingElement());
            const { id: uniqueId } = result.current;

            expect(uniqueId).not.toBe('');
            expect(uniqueId).toMatch(/^heading-\d+$/);
            expect(uniqueIds).not.toContain(uniqueId);

            uniqueIds.push(uniqueId);
        }
    });

    test('should return the same heading element id for every re-render', () => {
        const { result, rerender } = renderHook(() => useComponentHeadingElement());
        const { id: uniqueId } = result.current;

        rerender();
        expect(result.current.id).toBe(uniqueId);
    });

    test('should set heading element id as aria-labeledby attribute on componentRef element', async () => {
        const headingText = 'Title';

        render(
            <ComponentRoot>
                <Heading>{headingText}</Heading>
            </ComponentRoot>
        );

        const componentRootElement = screen.getByTestId('root');
        const headingElement = screen.getByText(headingText);

        [componentRootElement, headingElement].forEach(el => {
            expect(el).toBeInTheDocument();
            expect(el).toBeVisible();
        });

        expect(componentRootElement.getAttribute('aria-labeledby')).toBe(headingElement.id);
    });
});
