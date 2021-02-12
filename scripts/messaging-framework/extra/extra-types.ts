'use strict';

/**
 * Collects such fields which key starts with a specified string.
 * 
 * @example
 * ```ts
 * type originalFields = {
 *   thisWillBeRemoved: 21;
 *   okString: 42;
 * };
 * type myFields = FilterFields<originalFields, 'ok'>; // => { okString: 42 }
 * ```
 */
export type FilterFields<Fields, StringBegin extends string> = Pick<Fields, {
    [Key in keyof Fields]: Key extends `${StringBegin}${infer Tail}` ? Key : never
}[keyof Fields]>;


/**
 * Applies PascalCase naming convention to a string.
 * 
 * @example
 * ```ts
 * type myString = PascalCase<'what-a-cruel-world', '-'>; // => 'WhatACruelWorld'.
 * ```
 */
export type PascalCase<Str extends string, Separator extends string> =
    Concatenate<CapitalizeAll<LowercaseAll<Split<Str, Separator>>>>;


/**
 * Concatenates values of an array into a string.
 * 
 * - Default join is an empty string:
 * ```ts
 * type myString = Concatenate<['sup', 'e', 'r']>; // => 'super'.
 * ```
 *
 * - Custom join:
 * ```ts
 * type myString = Concatenate<['sup', 'e', 'r'], '_'> // => 'sup_e_r'.
 * ```
 * 
 * - Custom accumulator:
 * ```ts
 * type myString = Concatenate<['sup', 'e', 'r'], '', '_'>; // => '_super'.
 * ```
 */
export type Concatenate<StringArray extends Array<unknown>, Join extends string = '', Accumulator extends string = ''> =
    StringArray extends [`${infer Head}`, ... infer Tail]
    ? Concatenate<Tail, Join, `${Accumulator}${Accumulator extends '' ? '' : Join}${Head}`>
    : Accumulator;


/**
 * Replaces the first letter of each element to a capital letter.
 * 
 * @example
 * ```ts
 * type myArray = CapitalizeAll<['hello', 'world']>; // => ['Hello', 'World'].
 * ```
 */
export type CapitalizeAll<StringArray extends Array<unknown>, Accumulator extends Array<string> = []> =
    StringArray extends [`${infer Head}`, ... infer Tail]
    ? CapitalizeAll<Tail, [...Accumulator, Capitalize<Head>]>
    : Accumulator;


/**
 * Sets all elements to lowercase.
 * 
 * @example
 * ```ts
 * type myArray = LowercaseAll<['HeLLo', 'WORLD']>; // => ['hello', 'world'].
 * ```
 */
export type LowercaseAll<StringArray extends Array<unknown>, Accumulator extends Array<string> = []> =
    StringArray extends [`${infer Head}`, ... infer Tail]
    ? LowercaseAll<Tail, [...Accumulator, Lowercase<Head>]>
    : Accumulator;


/**
 * Splits a string into an array.
 * 
 * - Default separator is an empty string:
 * ```ts
 * type myArray = Split<'aloha'>; // => ['a', 'l', 'o', 'h', 'a'].
 * ```
 * 
 * - Custom separator:
 * ```ts
 * type myArray = Split<'aloha_bloha', '_'>; // => ['aloha', 'bloha]
 * ```
 */
export type Split<Str extends string, Separator extends string = ''> =
    Str extends `${infer Head}${Separator}${infer Tail}`
    ? [Head, ...Split<Tail, Separator>]
    : Str extends '' ? [] : [Str];


/**
 * Replaces all occurrences of SearchValue with ReplaceValue.
 * 
 * - Default value of replace is an empty string:
 * ```ts
 * type myString = Replace<'aaabababaaa', 'aaa'>; // => 'babab'.
 * ```
 * 
 * - Custom value of replace:
 * ```ts
 * type myString = Replace<'hello, world', 'hello,', 'cruel'>; // => 'cruel world'.
 * ```
 */
export type Replace<Str extends string, SearchValue extends string, ReplaceValue extends string = '', Accumulator extends string = ''> =
    Str extends `${SearchValue}${infer Tail}`
    ? Replace<Tail, SearchValue, ReplaceValue, `${Accumulator}${ReplaceValue}`>
    : Str extends `${infer Head}${infer Tail}`
    ? Replace<Tail, SearchValue, ReplaceValue, `${Accumulator}${Head}`>
    : Accumulator;
