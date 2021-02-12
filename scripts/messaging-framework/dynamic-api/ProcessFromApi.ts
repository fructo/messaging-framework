'use strict';

import { TProcessFromApi } from './TProcessFromApi.js';
import { convertToPascalCase } from '../extra/extra-utils.js';


/**
 * Constructs methods that start with 'processFrom'.
 * 
 * @see {@link TProcessFromApi}
 */
export function constructProcessFromApiMethods<Protocol>(
    protocol: Protocol,
    methodBodyFactory: (methodName: keyof TProcessFromApi<Protocol>) => (...args: Array<unknown>) => void
): TProcessFromApi<Protocol> {
    const api: Partial<TProcessFromApi<Protocol>> = {};
    const methodsScheme = constructSendFromApiMethodsScheme(protocol);
    methodsScheme.forEach(([methodName]) => {
        (api[methodName] as unknown) = methodBodyFactory(methodName);
    });
    return api as unknown as TProcessFromApi<Protocol>;
}


function constructSendFromApiMethodsScheme<Protocol>(protocol: Protocol): Array<[keyof TProcessFromApi<Protocol> & string]> {
    return (Object.keys(protocol) as Array<keyof Protocol & string>)
        .filter(protocolKey => protocolKey.startsWith('ALLOWED_MESSAGES_FROM_'))
        .map(protocolKey => constructMethodsScheme(protocol, protocolKey))
        .flatMap(x => x);
}


function constructMethodsScheme<Protocol>(
    protocol: Protocol,
    protocolKey: keyof Protocol & string
): Array<[keyof TProcessFromApi<Protocol> & string]> {
    const direction = protocolKey.replace('ALLOWED_MESSAGES_FROM_', '');
    return (protocol[protocolKey] as unknown as Array<{ [key: string]: unknown }>)
        .map(messagesFactory =>
            Object.keys(messagesFactory)
                .filter(factoryKey => factoryKey === factoryKey.toUpperCase())
                .map(messageName => `processFrom${convertToPascalCase(direction, '_')}Message${convertToPascalCase(messageName, '_')}`)
        ) as Array<[keyof TProcessFromApi<Protocol> & string]>;
}
