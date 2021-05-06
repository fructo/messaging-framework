'use strict';

import { PascalCase } from './extra-types.js';


/**
 * Applies PascalCase naming convention to a string.
 * 
 * @example
 * ```ts
 * const pascalCase = convertToPascalCase('HEY_BROTHER_AND_sister', '_'); // => 'HeyBrotherAndSister'
 * ```
 */
export function convertToPascalCase<T extends string, S extends string>(str: T, separator: S): PascalCase<T, S> {
    return <PascalCase<T, S>>str
        .toLowerCase()
        .split(separator)
        .map(word => word.replace(/^\w/, firstLetter => firstLetter.toUpperCase()))
        .join('');
}

export function collectClassKeys(klass: unknown): Array<string> {
    const keys: Array<string> = [];
    for (const key in klass as Record<string, unknown>) {
        keys.push(key);
    }
    return keys;
}
