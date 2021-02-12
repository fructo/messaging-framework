'use strict';

import { FilterFields, Replace } from '../extra/extra-types.js';


/**
 * Constructs names for events that will be fired from the message center.
 * 
 * @example
 * ```ts
 * type PROTOCOL = {
 *   ALLOWED_MESSAGES_TO_FIRST_DIRECTION: []
 *   ALLOWED_MESSAGES_TO_SECOND_DIRECTION: []
 *   ALLOWED_MESSAGES_FROM_ANOTHER_DIRECTION: []
 * };
 * type names = TEventName<PROTOCOL, 'TO'>; // => 'message-to-first-direction' | 'message-to-second-direction'
 * ```
 */
export type TEventName<Protocol, Direction extends 'TO' | 'FROM'> = keyof {
    [Key in keyof FilterFields<Protocol, `ALLOWED_MESSAGES_${Direction}`> as
    `message-${Replace<Lowercase<Replace<Key & string, 'ALLOWED_MESSAGES_'>>, '_', '-'>}`
    ]: never;
};
