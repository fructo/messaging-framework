'use strict';

import { FilterFields, PascalCase, Replace } from '../../extra/extra-types.js';


/**
 * @example
 * ```ts
 * const PROTOCOL = {
 *   ALLOWED_MESSAGES_FROM_SOMEWHERE: []
 * };
 * 
 * type api = TCenterSendingMethodsContainer<typeof PROTOCOL>; // => { sendToSomewhere(message: unknown): void }
 * ```
 */
export type TCenterSendingMethodsContainer<TProtocol> = {
    [Key in keyof FilterFields<TProtocol, 'ALLOWED_MESSAGES_TO_'>
    as `send${PascalCase<Replace<Key, 'ALLOWED_MESSAGES_'>, '_'>}`
    ]: (message: unknown) => void;
};
