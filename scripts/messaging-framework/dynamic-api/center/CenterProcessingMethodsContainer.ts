'use strict';

import { TCenterProcessingMethodsContainer } from './TCenterProcessingMethodsContainer.js';
import { convertToPascalCase } from '../../extra/extra-utils.js';
import { TEventName } from '../TEventName.js';
import { IMessageFactory } from '../../message/IMessageFactory.js';
import { IMessage } from '../../message/IMessage.js';

type TMessagesFactoryClass = { [key: string]: IMessageFactory<IMessage> };


/**
 * Creates an object that will contain all processing methods defined in a `protocol`.
 * The internal structure of the methods will be created by the function `methodBodyFactory`.
 */
export function createCenterProcessingMethodsContainer<TProtocol>(
    protocol: TProtocol,
    methodBodyFactory: (methodName: keyof TCenterProcessingMethodsContainer<TProtocol>, eventName: TEventName<TProtocol, 'FROM'>, headersMap: Map<string, [IMessageFactory<IMessage>, string]>) => (...args: Array<unknown>) => void
): TCenterProcessingMethodsContainer<TProtocol> {
    const methodsContainer = {} as TCenterProcessingMethodsContainer<TProtocol>;
    const processingMethodsNames = createCenterProcessingMethodsNamesAndEventsNames(protocol);
    processingMethodsNames.forEach(([methodName, eventName, headersMap]) => {
        (methodsContainer[methodName] as unknown) = methodBodyFactory(methodName, eventName, headersMap);
    });
    return methodsContainer;
}


/**
 * @example
 * ```ts
 * const PROTOCOL = {
 *   ALLOWED_MESSAGES_FROM_SOMEWHERE: []
 * };
 * 
 * const container = createCenterProcessingMethodsNamesAndEventsNames(PROTOCOL); // => [['processFromSomewhere', 'message-from-somewhere', <map>]]
 * ```
 */
function createCenterProcessingMethodsNamesAndEventsNames<TProtocol>(
    protocol: TProtocol
): Array<[keyof TCenterProcessingMethodsContainer<TProtocol> & string, TEventName<TProtocol, 'FROM'>, Map<string, [IMessageFactory<IMessage>, string]>]> {
    return (Object.keys(protocol) as Array<keyof TProtocol & string>)
        .filter(protocolKey => protocolKey.startsWith('ALLOWED_MESSAGES_FROM_'))
        .map(protocolKey => {
            const direction = protocolKey.replace('ALLOWED_MESSAGES_', '');
            const processingMethodName = `process${convertToPascalCase(direction, '_')}`;
            const eventName = `message-${direction.replaceAll('_', '-').toLowerCase()}`;
            const headersMap = createMessagesHeadersMap(direction, protocol[protocolKey] as unknown as Array<TMessagesFactoryClass>);
            return [processingMethodName, eventName, headersMap];
        }) as Array<[keyof TCenterProcessingMethodsContainer<TProtocol> & string, TEventName<TProtocol, 'FROM'>, Map<string, [IMessageFactory<IMessage>, string]>]>;
}


function createMessagesHeadersMap(direction: string, messagesFactoriesClasses: Array<TMessagesFactoryClass>) {
    const map = new Map<string, [IMessageFactory<IMessage>, string]>();
    messagesFactoriesClasses.forEach(factoryClass => {
        Object
            .keys(factoryClass)
            .filter(factoryKey => factoryKey === factoryKey.toUpperCase())
            .forEach(factoryKey => {
                const messageHeader = factoryKey.toLocaleLowerCase().replaceAll('_', '-');
                const messageFactory = factoryClass[factoryKey];
                const processingMethodName = `process${convertToPascalCase(direction, '_')}Message${convertToPascalCase(factoryKey, '_')}`;
                map.set(messageHeader, [messageFactory, processingMethodName]);
            });
    });
    return map;
}
