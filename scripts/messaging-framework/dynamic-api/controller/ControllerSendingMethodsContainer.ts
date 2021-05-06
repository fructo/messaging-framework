'use strict';

import { TControllerSendingMethodsContainer } from './TControllerSendingMethodsContainer.js';
import { collectClassKeys, convertToPascalCase } from '../../extra/extra-utils.js';
import { IMessageFactory } from '../../message/IMessageFactory.js';
import { IMessage } from '../../message/IMessage.js';


/**
 * Creates an object that will contain all sending methods defined in a `protocol`.
 * The internal structure of the methods will be created by the function `methodBodyFactory`.
 */
export function createControllerSendingMethodsContainer<TProtocol>(
    protocol: TProtocol,
    methodBodyFactory: (direction: string, messageFactory: IMessageFactory<IMessage>) => (...args: Array<unknown>) => void
): TControllerSendingMethodsContainer<TProtocol> {
    const methodsContainer = {} as TControllerSendingMethodsContainer<TProtocol>;
    const sendingMethodsNamesAndDirections = createControllerSendingMethodsNamesAndDirections(protocol);
    sendingMethodsNamesAndDirections.forEach(([methodName, direction, messageFactory]) => {
        (methodsContainer[methodName] as unknown) = methodBodyFactory(direction, messageFactory);
    });
    return methodsContainer;
}


function createControllerSendingMethodsNamesAndDirections<TProtocol>(
    protocol: TProtocol
): Array<[keyof TControllerSendingMethodsContainer<TProtocol> & string, string, IMessageFactory<IMessage>]> {
    return (Object.keys(protocol) as Array<keyof TProtocol & string>)
        .filter(protocolKey => protocolKey.startsWith('ALLOWED_MESSAGES_TO_'))
        .map(protocolKey => createControllerSendingMethodsNamesAndDirectionsFromProtocolKey(protocol, protocolKey))
        .flatMap(x => x);
}


function createControllerSendingMethodsNamesAndDirectionsFromProtocolKey<TProtocol>(
    protocol: TProtocol,
    protocolKey: keyof TProtocol & string
): Array<[keyof TControllerSendingMethodsContainer<TProtocol> & string, string, IMessageFactory<IMessage>]> {
    const direction = protocolKey.replace('ALLOWED_MESSAGES_', '');
    type TMessagesFactoryClass = { [key: string]: IMessageFactory<IMessage> };
    const typedProtocolValue = protocol[protocolKey] as unknown as Array<TMessagesFactoryClass>;
    const processingMethodsNames = typedProtocolValue
        .map(messagesFactoryClass =>
            collectClassKeys(messagesFactoryClass)
                .filter(factoryClassKey => factoryClassKey === factoryClassKey.toUpperCase())
                .map(factoryClassKey => [`send${convertToPascalCase(direction, '_')}Message${convertToPascalCase(factoryClassKey, '_')}`, direction, messagesFactoryClass[factoryClassKey]]))
        .flatMap(x => x);
    return processingMethodsNames as Array<[keyof TControllerSendingMethodsContainer<TProtocol> & string, string, IMessageFactory<IMessage>]>;
}
