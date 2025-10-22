import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import cx from 'classnames';
import { InteractionKeyCode } from '../../types';
import { StepperProps } from './types';
import { Step } from './Step';
import './Stepper.scss';

export const Stepper = ({ index, onChange, variant = 'vertical', children, nextStepDisabled, ariaLabel }: StepperProps) => {
    const [latestActiveStep, setLatestActiveStep] = useState(index);
    const listRef = useRef<HTMLOListElement>(null);
    const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [focusedStep, setFocusedStep] = useState(index);

    const steps = useMemo(() => {
        const childrenArray = Array.isArray(children) ? children : [children];
        return childrenArray.filter(Boolean);
    }, [children]);

    const totalSteps = steps.length;
    const isHorizontal = variant === 'horizontal';

    useEffect(() => {
        if (index > latestActiveStep) {
            setLatestActiveStep(index);
        }
    }, [index, latestActiveStep]);

    const canActivate = useCallback(
        (nextIndex: number) => {
            if (nextStepDisabled && nextIndex !== latestActiveStep) return false;
            return nextIndex <= latestActiveStep + 1;
        },
        [latestActiveStep, nextStepDisabled]
    );

    const handleStepClick = useCallback(
        (stepIndex: number) => {
            if (canActivate(stepIndex)) {
                setFocusedStep(stepIndex);
                onChange(stepIndex);
            }
        },
        [canActivate, onChange]
    );

    const focusStep = useCallback((stepIndex: number) => {
        const stepElement = stepRefs.current[stepIndex];
        if (stepElement) {
            stepElement.focus();
        }
    }, []);

    const focusNext = useCallback(() => {
        const nextIndex = Math.min(focusedStep + 1, totalSteps - 1);
        if (canActivate(nextIndex)) {
            setFocusedStep(nextIndex);
            focusStep(nextIndex);
        }
    }, [canActivate, focusStep, focusedStep, totalSteps]);

    const focusPrev = useCallback(() => {
        const prevIndex = Math.max(focusedStep - 1, 0);
        setFocusedStep(prevIndex);
        focusStep(prevIndex);
    }, [focusStep, focusedStep]);

    const activateFocused = useCallback(() => {
        const focusedElement = document.activeElement as HTMLButtonElement;
        const stepIndex = stepRefs.current.indexOf(focusedElement);
        if (stepIndex !== -1 && canActivate(stepIndex)) {
            onChange(stepIndex);
        }
    }, [canActivate, onChange]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            switch (event.code) {
                case InteractionKeyCode.ARROW_RIGHT:
                    event.preventDefault();
                    isHorizontal && focusNext();
                    break;
                case InteractionKeyCode.ARROW_LEFT:
                    event.preventDefault();
                    isHorizontal && focusPrev();
                    break;
                case InteractionKeyCode.ARROW_DOWN:
                    event.preventDefault();
                    !isHorizontal && focusNext();
                    break;
                case InteractionKeyCode.ARROW_UP:
                    event.preventDefault();
                    !isHorizontal && focusPrev();
                    break;
                case InteractionKeyCode.ENTER:
                case InteractionKeyCode.SPACE:
                    event.preventDefault();
                    activateFocused();
                    break;
            }
        },
        [isHorizontal, focusNext, focusPrev, activateFocused]
    );

    return (
        <nav className="adyen-pe-stepper">
            <ol
                aria-label={ariaLabel}
                ref={listRef}
                className={cx('adyen-pe-stepper__list', {
                    'adyen-pe-stepper__list--horizontal': isHorizontal,
                })}
                onKeyDown={handleKeyDown}
            >
                {steps.map((step, stepIndex) => (
                    <Step
                        totalSteps={totalSteps}
                        key={stepIndex}
                        index={stepIndex}
                        active={stepIndex === index}
                        completed={stepIndex < index}
                        disabled={!canActivate(stepIndex)}
                        onClick={() => handleStepClick(stepIndex)}
                        ref={(el: any) => {
                            if (el) {
                                stepRefs.current[stepIndex] = el;
                            }
                        }}
                    >
                        {step.props?.children || step}
                    </Step>
                ))}
            </ol>
        </nav>
    );
};
