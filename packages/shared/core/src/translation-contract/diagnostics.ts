import type { TranslationDiagnostic } from './types';

export type TranslationDiagnosticReporter = (diagnostic: TranslationDiagnostic) => void;

const diagnosticId = ({ code, domain, publicKey, targetKey }: TranslationDiagnostic): string =>
    [code, domain, publicKey, targetKey].filter(Boolean).join(':');

export class TranslationDiagnostics {
    readonly #reported = new Set<string>();
    readonly #reporter?: TranslationDiagnosticReporter;

    constructor(reporter?: TranslationDiagnosticReporter) {
        this.#reporter = reporter;
    }

    report(diagnostic: TranslationDiagnostic): void {
        const id = diagnosticId(diagnostic);
        if (this.#reported.has(id)) return;
        this.#reported.add(id);

        try {
            this.#reporter?.(diagnostic);
        } catch {
            // Diagnostics are best effort and must not affect translation behavior.
        }
    }
}
