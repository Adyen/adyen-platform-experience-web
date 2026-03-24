import { createGreeting } from '../../domain/src';
import '@iex/sample-lib/sample.scss';

export function SampleComponent({ name }: { name: string }) {
    return <div class="adyen-pe-sample">{createGreeting(name)}</div>;
}
