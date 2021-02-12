'use strict';

import { FilterFields, PascalCase, Replace } from '../extra/extra-types.js';


/**
 * @example
 * ```ts
 * const PROTOCOL = {
 *   ALLOWED_MESSAGES_FROM_SOMEWHERE: []
 * };
 * 
 * type api = TSendFromApi<typeof PROTOCOL>; // => { sendFromSomewhere(message: unknown): void }
 * ```
 */
export type TSendFromApi<Protocol> = {
    [Key in keyof FilterFields<Protocol, 'ALLOWED_MESSAGES_FROM_'>
    as `send${PascalCase<Replace<Key, 'ALLOWED_MESSAGES_'>, '_'>}`
    ]: (message: unknown) => void;
};
