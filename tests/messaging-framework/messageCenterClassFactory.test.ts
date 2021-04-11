'use strict';

import test from 'ava';

import { controllerClassFactory, messageCenterClassFactory } from '@fructo/messaging-framework';

import { PROTOCOL, IMessageSayHi, MyFirstDirectionMessages } from './_protocol.js';


test('MessageCenter has on() method', t => {
    const center = new (messageCenterClassFactory({}));
    t.true('on' in center);
});

test('MessageCenter dispatches "controller-error" event', async t => {
    const center = new (messageCenterClassFactory(PROTOCOL));
    const ERROR = 42;
    center.on('controller-error', (error) => {
        t.deepEqual(error, [ERROR]);
    });
    class MyController extends controllerClassFactory(PROTOCOL) {

        /**
         * @override
         */
        public readonly processFromMyFirstDirectionMessageSayHi = async (message: IMessageSayHi) => {
            throw ERROR;
        }

    }
    center.attachController(new MyController(center));
    center.processFromMyFirstDirection(MyFirstDirectionMessages.SAY_HI.create({}));
});

test('MessageCenter dispatches "protocol-error" event', t => {
    const INVALID_MESSAGES = [null, 10, '', 'bloha', {}, { header: 'hey' }, { header: null }, { header: 10 }, { header: {} }];
    t.plan(INVALID_MESSAGES.length);

    const center = new (messageCenterClassFactory(PROTOCOL));
    center.on('protocol-error', () => {
        t.pass();
    });
    INVALID_MESSAGES.forEach(invalidMessage => center.processFromMyFirstDirection(invalidMessage));
});

test('MessageCenter dispatches an event (processFrom)', t => {
    const center = new (messageCenterClassFactory(PROTOCOL));
    const MESSAGE = MyFirstDirectionMessages.SAY_HI.create({});
    center.on('message-from-my-first-direction', (message) => {
        t.is(message, MESSAGE);
    });
    center.processFromMyFirstDirection(MESSAGE);
});

test('MessageCenter redirects a message from the center to a controller', async t => {
    const center = new (messageCenterClassFactory(PROTOCOL));
    const MESSAGE = MyFirstDirectionMessages.SAY_HI.create({});
    class MyController extends controllerClassFactory(PROTOCOL) {

        /**
         * @override
         */
        public readonly processFromMyFirstDirectionMessageSayHi = async (message: IMessageSayHi) => {
            t.is(message, MESSAGE);
        }

    }
    center.attachController(new MyController(center));
    center.processFromMyFirstDirection(MESSAGE);
});

test('MessageCenter invokes setUp method on attachment', t => {
    const center = new (messageCenterClassFactory({}));
    class MyController extends controllerClassFactory({}) {
        async setUp() {
            t.pass();
        }
    }
    center.attachController(new MyController(center));
});

test('MessageCenter triggers setUp method on creation', t => {
    class MessageCenter extends messageCenterClassFactory(PROTOCOL) {
        async setUp() {
            t.pass();
        }
    }
    new MessageCenter();
});

test('MessageCenter has attachController() method', t => {
    const center = new (messageCenterClassFactory({}));
    t.true('attachController' in center);
});

test('MessageCenter attaches controllers defined in the "CONTROLLERS" property', t => {
    class MyController extends controllerClassFactory(PROTOCOL) {
        public readonly processFromMyFirstDirectionMessageSayHi = async (message: IMessageSayHi) => {
            t.pass();
        }
    }
    class MessageCenter extends messageCenterClassFactory(PROTOCOL) {
        protected static readonly CONTROLLERS = [
            MyController
        ];
    }
    const center = new MessageCenter();
    center.processFromMyFirstDirection(MyFirstDirectionMessages.SAY_HI.create({}));
});

test('MessageCenter dispatches an event (sendTo)', t => {
    const center = new (messageCenterClassFactory(PROTOCOL));
    const MESSAGE = MyFirstDirectionMessages.SAY_HI.create({});
    center.on('message-to-my-first-direction', (message) => {
        t.is(message, MESSAGE);
    });
    center.sendToMyFirstDirection(MESSAGE);
});
