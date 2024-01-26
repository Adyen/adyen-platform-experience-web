import { CoreOptions } from '@src/core';
import { Core } from './core';
import './components/shared.scss';
import './style/index.scss';

export * from './core';
export * from './components';
export * from './types';
export async function AdyenFP<T extends CoreOptions<T>>(props?: T) {
    const core = new Core<T>(props ?? {});
    return await core.initialize();
}
