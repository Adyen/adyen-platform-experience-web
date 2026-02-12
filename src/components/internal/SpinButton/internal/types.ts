export interface SpinButtonContext extends Omit<EventTarget, 'dispatchEvent'>, SpinButtonContextWritableFields {
    // disabled state
    readonly decrementDisabled: boolean;
    readonly incrementDisabled: boolean;

    // calibration
    readonly leap: number;
    readonly max: number;
    readonly min: number;
    readonly step: number;
    readonly recalibrate: (config?: SpinButtonCalibrationConfigProps) => void;

    // stop notification signal
    readonly signal: AbortSignal;
}

export interface SpinButtonContextElements {
    get containerElement(): HTMLElement | null;
    set containerElement(elem: HTMLElement | null);
    get decrementButton(): HTMLButtonElement | null;
    set decrementButton(elem: HTMLButtonElement | null);
    get incrementButton(): HTMLButtonElement | null;
    set incrementButton(elem: HTMLButtonElement | null);
    get valueElement(): HTMLElement | null;
    set valueElement(elem: HTMLElement | null);
}

export interface SpinButtonContextInteractions {
    readonly onButtonClick: (evt: MouseEvent) => void;
    readonly onInteractionKeyPress: (evt: KeyboardEvent) => void;
}

export interface SpinButtonContextWritableFields {
    get disabled(): boolean;
    set disabled(disabled: boolean | undefined);
    get value(): number;
    set value(value: number | undefined);
}

export type SpinButtonCalibrationConfigProps = Partial<Pick<SpinButtonContext, 'leap' | 'max' | 'min' | 'step'>>;
export type SpinButtonPushStateCallback = (currentState: SpinButtonState) => unknown;

export type SpinButtonRecord = Omit<SpinButtonContext, keyof EventTarget | keyof SpinButtonContextWritableFields | 'signal'> &
    SpinButtonContextElements &
    SpinButtonContextInteractions &
    SpinButtonContextWritableFields & {
        set onStatePush(callback: SpinButtonPushStateCallback | undefined | null);
    };

export type SpinButtonState = Omit<
    SpinButtonRecord,
    keyof SpinButtonContextElements | keyof SpinButtonContextInteractions | 'onStatePush' | 'recalibrate'
>;

export const enum SpinButtonValueOffset {
    STEP_INCREMENT,
    STEP_DECREMENT,
    LEAP_INCREMENT,
    LEAP_DECREMENT,
}
