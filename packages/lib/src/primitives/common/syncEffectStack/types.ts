export interface SyncEffectStack<Effect extends (...args: any[]) => any = () => void> {
    readonly bind: <T extends (...args: any[]) => any>(fn: T) => T;
    readonly effect: Effect;
}
