'use strict';

import test from 'ava';

import { controllerFactory, messageCenterFactory } from '@fructo/messaging-framework';

import { PROTOCOL, IMessageSayHi, MyFirstDirectionMessages } from './_protocol.js';


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

test('Controller has "processFrom" methods', t => {
    class MyCenter extends messageCenterFactory(PROTOCOL) { }
    class MyController extends controllerFactory(PROTOCOL) { }
    const center = new MyCenter();
    const controller = new MyController(center);
    t.true('processFromMyFirstDirectionMessageSayHi' in controller);
    t.true('processFromMySecondDirectionMessageEcho' in controller);
});

test('Controller\'s "processFrom" method is callable', async t => {
    class MyCenter extends messageCenterFactory(PROTOCOL) { }
    class MyController extends controllerFactory(PROTOCOL) { }
    const center = new MyCenter();
    const controller = new MyController(center);
    await t.notThrowsAsync(async () => await controller.processFromMyFirstDirectionMessageSayHi(MyFirstDirectionMessages.SAY_HI.create({})));
});

test('Controller\'s "processFrom" method is overridable', async t => {
    class MyCenter extends messageCenterFactory(PROTOCOL) { }
    class MyController extends controllerFactory(PROTOCOL) {

        public readonly processFromMyFirstDirectionMessageSayHi = async (message: IMessageSayHi) => {
            t.pass();
        }

    }
    const center = new MyCenter();
    const controller = new MyController(center);
    await controller.processFromMyFirstDirectionMessageSayHi(MyFirstDirectionMessages.SAY_HI.create({}));
});
