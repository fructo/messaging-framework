'use strict';

import { TCenterSendingMethodsContainer } from './TCenterSendingMethodsContainer.js';
import { convertToPascalCase } from '../../extra/extra-utils.js';
import { TEventName } from '../TEventName.js';


/**
 * Creates an object that will contain all sending methods defined in a `protocol`.
 * The internal structure of the methods will be created by the function `methodBodyFactory`.
 */
export function createCenterSendingMethodsContainer<TProtocol>(
    protocol: TProtocol,
    methodBodyFactory: (methodName: keyof TCenterSendingMethodsContainer<TProtocol>, eventName: TEventName<TProtocol, 'FROM'>) => (...args: Array<unknown>) => void
): TCenterSendingMethodsContainer<TProtocol> {
    const methodsContainer = {} as TCenterSendingMethodsContainer<TProtocol>;
    const sendingMethodsNames = createCenterSendingMethodsNamesAndEventsNames(protocol);
    sendingMethodsNames.forEach(([methodName, eventName]) => {
        (methodsContainer[methodName] as unknown) = methodBodyFactory(methodName, eventName);
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
 * const container = createCenterSendingMethodsNamesAndEventsNames(PROTOCOL); // => [['sendToSomewhere', 'message-to-somewhere']]
 * ```
 */
function createCenterSendingMethodsNamesAndEventsNames<TProtocol>(
    protocol: TProtocol
): Array<[keyof TCenterSendingMethodsContainer<TProtocol> & string, TEventName<TProtocol, 'TO'>]> {
    return (Object.keys(protocol) as Array<keyof TProtocol & string>)
        .filter(protocolKey => protocolKey.startsWith('ALLOWED_MESSAGES_TO_'))
        .map(protocolKey => protocolKey.replace('ALLOWED_MESSAGES_', ''))
        .map(direction => [createCenterSendingMethodName(direction), `message-${direction.replaceAll('_', '-').toLowerCase()}`]) as
        Array<[keyof TCenterSendingMethodsContainer<TProtocol> & string, TEventName<TProtocol, 'TO'>]>;
}


/**
 * @example
 * ```txt
 * TO_MY_DIRECTION => sendToMyDirection
 * ```
 */
export function createCenterSendingMethodName<TProtocol>(direction: string): keyof TCenterSendingMethodsContainer<TProtocol & string> {
    return `send${convertToPascalCase(direction, '_')}` as keyof TCenterSendingMethodsContainer<TProtocol & string>;
}
