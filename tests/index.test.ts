'use strict';

import test from 'ava';

import * as module from '@fructo/messaging-framework';


function testModuleExports() {
    const EXPORTS = [
        'controllerClassFactory',
        'messageCenterFactory'
    ];
    EXPORTS.forEach(unit => {
        test(`The module exports ${unit}`, t => {
            t.true(unit in module);
        });
    });
}

testModuleExports();
