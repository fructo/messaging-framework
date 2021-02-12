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
 *   ALLOWED_MESSAGES_FROM_SOMEWHERE: [MessagesFactory]
 * };
 * 
 * 
 * type api = TProcessFromApi<typeof PROTOCOL>; // => { processFromSomewhereMessageEchoMe(message: { greeting: string }) => Promise<void> }
 * ```
 */
export type TProcessFromApi<Protocol> = UnionToIntersection<{
    [Key in keyof FilterFields<Protocol, 'ALLOWED_MESSAGES_FROM_'>]: {
        [MessagesFactory in ((Protocol[Key] & Array<unknown>)[number])
        as Key
        ]: {
            +readonly [MessageName in keyof MessagesFactory
            as FormProcessMethodName<Key, FilterUppercase<MessageName>>
            ]: (message: ExtractFunctionReturnType<(MessagesFactory[MessageName] & { create: unknown })['create']>) => Promise<void>;
        }
    }[Key];
}[keyof FilterFields<Protocol, 'ALLOWED_MESSAGES_FROM_'>]>;

type FilterUppercase<Str> = Str extends string ? Str extends Uppercase<Str> ? Str : never : never;

type FormProcessMethodName<ProtocolKey extends string, MessageName extends string> =
    `process${PascalCase<Replace<ProtocolKey, 'ALLOWED_MESSAGES_'>, '_'>}Message${PascalCase<MessageName, '_'>}`;

type ExtractFunctionReturnType<F> = F extends (...args: infer Args) => infer Ret ? Ret : never;

type UnionToIntersection<U> = (U extends unknown ? (u: U) => U : never) extends (u: infer U) => U ? U : never;
