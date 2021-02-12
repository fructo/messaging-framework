'use strict';

import { FilterFields, PascalCase, Replace } from '../extra/extra-types.js';


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
 * 
 * type api = TSendToApi<typeof PROTOCOL>; // => { sendToSomewhereMessageEchoMe(message: { greeting: string }) => void }
 * ```
 */
export type TSendToApi<Protocol> = UnionToIntersection<Record<string, unknown> | {
    [Key in keyof FilterFields<Protocol, 'ALLOWED_MESSAGES_TO_'>]: {
        [MessagesFactory in ((Protocol[Key] & Array<unknown>)[number])
        as Key
        ]: {
            -readonly [MessageName in keyof MessagesFactory
            as FormSendMethodName<Key, FilterUppercase<MessageName>>
            ]: ReplaceFunctionReturnType<(MessagesFactory[MessageName] & { create: unknown })['create'], void>;
        }
    }[Key];
}[keyof FilterFields<Protocol, 'ALLOWED_MESSAGES_TO_'>]>;

type ReplaceFunctionReturnType<F, NewType> = F extends (...args: infer Args) => unknown ? (...args: Args) => NewType : never;

type FilterUppercase<Str> = Str extends string ? Str extends Uppercase<Str> ? Str : never : never;

type FormSendMethodName<ProtocolKey extends string, MessageName extends string> =
    `send${PascalCase<Replace<ProtocolKey, 'ALLOWED_MESSAGES_'>, '_'>}Message${PascalCase<MessageName, '_'>}`;

type UnionToIntersection<U> = (U extends unknown ? (u: U) => U : never) extends (u: infer U) => U ? U : never;
