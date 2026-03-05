// =============================================================================
// Core types
// =============================================================================

// prettier-ignore
export {
    AtomicValue,
    type Atom,
    type AtomConfig,
    type AtomicResetValue,
    type DeferredAtom,
    type Molecule,
    type WithAtomicValue,
    type WithAtomicValueOperations,
    type WithAtomicValueState,
} from './core/types';

// Backward-compatible alias (AtomProps was renamed to AtomConfig)
export type { AtomConfig as AtomProps } from './core/types';

// =============================================================================
// Core factories (vanilla JS — framework-agnostic)
// =============================================================================

// prettier-ignore
export {
    createAtom,
    createDelay,
    createMolecule,
} from './core';

// =============================================================================
// Preact hooks
// =============================================================================

// prettier-ignore
export {
    useAtom,
} from './preact/useAtom';

// prettier-ignore
export {
    useMolecule,
    type MoleculeProps,
} from './preact/useMolecule';
