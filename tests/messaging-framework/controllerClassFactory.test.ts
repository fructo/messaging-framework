'use strict';

import test from 'ava';

import { controllerClassFactory, messageCenterFactory } from '@fructo/messaging-framework';

import { PROTOCOL, IMessageSayHi, MyFirstDirectionMessages } from './_protocol.js';


test('Controller has setUp() method', t => {
    class MyController extends controllerClassFactory({}) { }
    const controller = new MyController({});
    t.true('setUp' in controller);
});

test('Controller\'s setUp() method is callable', async t => {
    class MyController extends controllerClassFactory({}) { }
    const controller = new MyController({});
    await t.notThrowsAsync(() => controller.setUp());
});

test('Controller\'s setUp() method is overridable', async t => {
    class MyController extends controllerClassFactory({}) {
        async setUp(): Promise<void> {
            t.pass();
        }
    }
    const controller = new MyController({});
    await controller.setUp();
});

test('Controller has "processFrom" methods', t => {
    class MyCenter extends messageCenterFactory(PROTOCOL) { }
    class MyController extends controllerClassFactory(PROTOCOL) { }
    const center = new MyCenter();
    const controller = new MyController(center);
    t.true('processFromMyFirstDirectionMessageSayHi' in controller);
    t.true('processFromMySecondDirectionMessageEcho' in controller);
});

test('Controller\'s "processFrom" method is callable', async t => {
    class MyCenter extends messageCenterFactory(PROTOCOL) { }
    class MyController extends controllerClassFactory(PROTOCOL) { }
    const center = new MyCenter();
    const controller = new MyController(center);
    await t.notThrowsAsync(async () => await controller.processFromMyFirstDirectionMessageSayHi(MyFirstDirectionMessages.SAY_HI.create({})));
});

test('Controller\'s "processFrom" method is overridable', async t => {
    class MyCenter extends messageCenterFactory(PROTOCOL) { }
    class MyController extends controllerClassFactory(PROTOCOL) {

        public readonly processFromMyFirstDirectionMessageSayHi = async (message: IMessageSayHi) => {
            t.pass();
        }

    }
    const center = new MyCenter();
    const controller = new MyController(center);
    await controller.processFromMyFirstDirectionMessageSayHi(MyFirstDirectionMessages.SAY_HI.create({}));
});

test('Controller has a "sendTo" method', t => {
    class MyCenter extends messageCenterFactory(PROTOCOL) { }
    class MyController extends controllerClassFactory(PROTOCOL) { }
    const center = new MyCenter();
    const controller = new MyController(center);
    t.true('sendToMyFirstDirectionMessageSayHi' in controller);
});

test('Controller\'s "sendTo" method is callable', t => {
    class MyCenter extends messageCenterFactory(PROTOCOL) { }
    class MyController extends controllerClassFactory(PROTOCOL) { }
    const center = new MyCenter();
    const controller = new MyController(center);
    t.notThrows(() => controller.sendToMyFirstDirectionMessageSayHi(MyFirstDirectionMessages.SAY_HI.create({})));
});

test('Controller\'s "sendTo" method transfers a message to the center', t => {
    const MESSAGE = MyFirstDirectionMessages.SAY_HI.create({});
    class MyCenter extends messageCenterFactory(PROTOCOL) {
        public readonly sendToMyFirstDirection = (message: unknown) => {
            t.pass();
        }
    }
    class MyController extends controllerClassFactory(PROTOCOL) { }
    const center = new MyCenter();
    const controller = new MyController(center);
    controller.sendToMyFirstDirectionMessageSayHi(MESSAGE);
});
