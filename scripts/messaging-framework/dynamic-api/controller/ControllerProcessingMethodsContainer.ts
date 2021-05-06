'use strict';

import { TControllerProcessingMethodsContainer } from './TControllerProcessingMethodsContainer.js';
import { collectClassKeys, convertToPascalCase } from '../../extra/extra-utils.js';
import { IMessageFactory } from '../../message/IMessageFactory.js';
import { IMessage } from '../../message/IMessage.js';


/**
 * Creates an object that will contain all processing methods defined in a `protocol`.
 * The internal structure of the methods will be created by the function `methodBodyFactory`.
 */
export function createControllerProcessingMethodsContainer<TProtocol>(
    protocol: TProtocol,
    methodBodyFactory: () => (...args: Array<unknown>) => void
): TControllerProcessingMethodsContainer<TProtocol> {
    const methodsContainer = {} as TControllerProcessingMethodsContainer<TProtocol>;
    const processingMethodsNames = createControllerProcessingMethodsNames(protocol);
    processingMethodsNames.forEach(methodName => {
        (methodsContainer[methodName] as unknown) = methodBodyFactory();
    });
    return methodsContainer;
}


function createControllerProcessingMethodsNames<TProtocol>(protocol: TProtocol): Array<keyof TControllerProcessingMethodsContainer<TProtocol> & string> {
    return (Object.keys(protocol) as Array<keyof TProtocol & string>)
        .filter(protocolKey => protocolKey.startsWith('ALLOWED_MESSAGES_FROM_'))
        .map(protocolKey => createControllerProcessingMethodsNamesFromProtocolKey(protocol, protocolKey))
        .flatMap(x => x);
}


function createControllerProcessingMethodsNamesFromProtocolKey<TProtocol>(
    protocol: TProtocol,
    protocolKey: keyof TProtocol & string
): Array<keyof TControllerProcessingMethodsContainer<TProtocol> & string> {
    const direction = protocolKey.replace('ALLOWED_MESSAGES_FROM_', '');
    type TMessagesFactoryClass = { [key: string]: IMessageFactory<IMessage> };
    const typedProtocolValue = protocol[protocolKey] as unknown as Array<TMessagesFactoryClass>;
    const processingMethodsNames = typedProtocolValue
        .map(messagesFactoryClass =>
            collectClassKeys(messagesFactoryClass)
                .filter(factoryClassKey => factoryClassKey === factoryClassKey.toUpperCase())
                .map(messageName => `processFrom${convertToPascalCase(direction, '_')}Message${convertToPascalCase(messageName, '_')}`))
        .flatMap(x => x);
    return processingMethodsNames as Array<keyof TControllerProcessingMethodsContainer<TProtocol> & string>;
}
