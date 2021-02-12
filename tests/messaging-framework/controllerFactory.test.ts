'use strict';

import test from 'ava';

import { controllerFactory } from '@fructo/messaging-framework';


test('Controller has setUp() method', t => {
    class MyController extends controllerFactory({}) { }
    const controller = new MyController({});
    t.true('setUp' in controller);
});

test('Controller\'s setUp() method is callable', async t => {
    class MyController extends controllerFactory({}) { }
    const controller = new MyController({});
    await t.notThrowsAsync(() => controller.setUp());
});

test('Controller\'s setUp() method is overridable', async t => {
    class MyController extends controllerFactory({}) {
        async setUp(): Promise<void> {
            t.pass();
        }
    }
    const controller = new MyController({});
    await controller.setUp();
});
