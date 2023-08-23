import React from 'react';
import { Container } from './Container';
import { ComponentMap } from '@adyen/adyen-fp-web';
import { ComponentOptions } from '@adyen/adyen-fp-web';

function ComponentScreen<Component extends keyof ComponentMap>(props: { component: Component; args: ComponentOptions<Component>; context: any }) {
    return <Container type={props.component} componentConfiguration={props.args} context={props.context} />;
}

export default ComponentScreen;
