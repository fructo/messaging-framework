'use strict';

import { TEventName } from './TEventName.js';
import { TSendToApi } from './TSendToApi.js';
import { convertToPascalCase } from '../extra/extra-utils.js';


/**
 * Constructs methods that start with 'sendTo'.
 * 
 * @see {@link TSendToApi}
 */
export function constructSendToApiMethods<Protocol>(
    protocol: Protocol,
    methodBodyFactory: (methodName: keyof TSendToApi<Protocol>, methodEvent: TEventName<Protocol, 'TO'>) => (...args: Array<unknown>) => void
): TSendToApi<Protocol> {
    const api: Partial<TSendToApi<Protocol>> = {};
    const methodsScheme = constructSendToApiMethodsScheme(protocol);
    methodsScheme.forEach(([methodName, methodEvent]) => {
        (api[methodName] as unknown) = methodBodyFactory(methodName, methodEvent);
    });
    return api as unknown as TSendToApi<Protocol>;
}


/**
 * @example
 * ```ts
 * class MessagesFactory {
 *   static ECHO_ME = {
 *     create({ greeting }: { greeting: string }): { greeting: string } {
 *       return { greeting }; 
 *     }
 *   }
 * }
 * 
 * const PROTOCOL = {
 *   ALLOWED_MESSAGES_TO_SOMEWHERE: [MessagesFactory]
 * };
 * 
 * const scheme = constructSendToApiMethodsScheme(PROTOCOL); // => [['sendToSomewhereMessageEchoMe', 'message-to-somewhere']]
 * ```
 */
function constructSendToApiMethodsScheme<Protocol>(protocol: Protocol): Array<[keyof TSendToApi<Protocol> & string, TEventName<Protocol, 'TO'>]> {
    return (Object.keys(protocol) as Array<keyof Protocol & string>)
        .filter(protocolKey => protocolKey.startsWith('ALLOWED_MESSAGES_TO_'))
        .map(protocolKey => constructMethodsScheme(protocol, protocolKey))
        .flatMap(x => x);
}


function constructMethodsScheme<Protocol>(
    protocol: Protocol,
    protocolKey: keyof Protocol & string
): Array<[keyof TSendToApi<Protocol> & string, TEventName<Protocol, 'TO'>]> {
    const direction = protocolKey.replace('ALLOWED_MESSAGES_TO_', '');
    const sendMethodsNames = (protocol[protocolKey] as unknown as Array<{ [key: string]: unknown }>)
        .map(messagesFactory =>
            Object.keys(messagesFactory)
                .filter(factoryKey => factoryKey === factoryKey.toUpperCase())
                .map(messageName => `sendTo${convertToPascalCase(direction, '_')}Message${convertToPascalCase(messageName, '_')}`)
        )
        .flatMap(x => x);
    return sendMethodsNames.map(methodName => [methodName, `message-to-${direction.replaceAll('_', '-').toLowerCase()}`]) as
        Array<[keyof TSendToApi<Protocol> & string, TEventName<Protocol, 'TO'>]>;
}
