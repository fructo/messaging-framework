'use strict';

import { FilterFields, PascalCase, Replace } from '../../extra/extra-types.js';


/**
 * @example
 * ```ts
 * const PROTOCOL = {
 *   ALLOWED_MESSAGES_FROM_SOMEWHERE: []
 * };
 * 
 * type api = TCenterProcessingMethodsContainer<typeof PROTOCOL>; // => { processFromSomewhere(message: unknown): void }
 * ```
 */
export type TCenterProcessingMethodsContainer<TProtocol> = {
    [Key in keyof FilterFields<TProtocol, 'ALLOWED_MESSAGES_FROM_'>
    as `process${PascalCase<Replace<Key, 'ALLOWED_MESSAGES_'>, '_'>}`
    ]: (message: unknown) => void;
};
