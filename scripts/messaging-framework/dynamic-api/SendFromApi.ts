'use strict';

import { TEventName } from './TEventName.js';
import { TSendFromApi } from './TSendFromApi.js';
import { convertToPascalCase } from '../extra/extra-utils.js';


/**
 * Constructs methods that start with 'sendFrom'.
 * 
 * @see {@link TSendFromApi}
 */
export function constructSendFromApiMethods<Protocol>(
    protocol: Protocol,
    methodBodyFactory: (methodName: keyof TSendFromApi<Protocol>, methodEvent: TEventName<Protocol, 'FROM'>) => (...args: Array<unknown>) => void
): TSendFromApi<Protocol> {
    const api: Partial<TSendFromApi<Protocol>> = {};
    const methodsScheme = constructSendFromApiMethodsScheme(protocol);
    methodsScheme.forEach(([methodName, methodEvent]) => {
        (api[methodName] as unknown) = methodBodyFactory(methodName, methodEvent);
    });
    return api as unknown as TSendFromApi<Protocol>;
}


/**
 * @example
 * ```ts
 * const PROTOCOL = {
 *   ALLOWED_MESSAGES_FROM_SOMEWHERE: []
 * };
 * 
 * const scheme = constructSendFromApiMethodsScheme(PROTOCOL); // => [['sendFromSomewhere', 'message-from-somewhere']]
 * ```
 */
function constructSendFromApiMethodsScheme<Protocol>(protocol: Protocol): Array<[keyof TSendFromApi<Protocol> & string, TEventName<Protocol, 'FROM'>]> {
    return (Object.keys(protocol) as Array<keyof Protocol & string>)
        .filter(protocolKey => protocolKey.startsWith('ALLOWED_MESSAGES_FROM_'))
        .map(protocolKey => protocolKey.replace('ALLOWED_MESSAGES_', ''))
        .map(direction => [`send${convertToPascalCase(direction, '_')}`, `message-${direction.replaceAll('_', '-').toLowerCase()}`]) as
        Array<[keyof TSendFromApi<Protocol> & string, TEventName<Protocol, 'FROM'>]>;
}
