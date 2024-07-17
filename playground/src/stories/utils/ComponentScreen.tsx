import React from 'react';
import { Container } from './Container';
import { ComponentMap, ComponentOptions } from '@adyen/adyen-platform-experience-web';

function ComponentScreen<Component extends keyof ComponentMap>(props: { component: Component; args: ComponentOptions<Component>; context: any }) {
    return <Container type={props.component} componentConfiguration={props.args} context={props.context} />;
}

export default ComponentScreen;
