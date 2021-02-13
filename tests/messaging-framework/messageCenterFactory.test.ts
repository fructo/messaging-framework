'use strict';

import test from 'ava';

import { controllerFactory, messageCenterFactory } from '@fructo/messaging-framework';

import { PROTOCOL, IMessageSayHi, MyFirstDirectionMessages } from './_protocol.js';


test('MessageCenter has on() method', t => {
    const center = new (messageCenterFactory({}));
    t.true('on' in center);
});

test('MessageCenter dispatches "controller-result" event', async t => {
    const center = new (messageCenterFactory(PROTOCOL));
    const RESULT = 31;
    center.on('controller-result', (result) => {
        t.is(result, RESULT);
    });
    class MyController extends controllerFactory(PROTOCOL) {

        /**
         * @override
         */
        public readonly processFromMyFirstDirectionMessageSayHi = async (message: IMessageSayHi) => {
            return RESULT;
        }

    }
    center.attachController(new MyController(center));
    center.sendFromMyFirstDirection(MyFirstDirectionMessages.SAY_HI.create({}));
});

test('MessageCenter dispatches "controller-error" event', async t => {
    const center = new (messageCenterFactory(PROTOCOL));
    const ERROR = 42;
    center.on('controller-error', (error) => {
        t.is(error, ERROR);
    });
    class MyController extends controllerFactory(PROTOCOL) {

        /**
         * @override
         */
        public readonly processFromMyFirstDirectionMessageSayHi = async (message: IMessageSayHi) => {
            throw ERROR;
        }

    }
    center.attachController(new MyController(center));
    center.sendFromMyFirstDirection(MyFirstDirectionMessages.SAY_HI.create({}));
});

test('MessageCenter dispatches "protocol-error" event', t => {
    const INVALID_MESSAGES = [null, 10, '', 'bloha', {}, { header: 'hey' }, { header: null }, { header: 10 }, { header: {} }];
    t.plan(INVALID_MESSAGES.length);

    const center = new (messageCenterFactory(PROTOCOL));
    center.on('protocol-error', () => {
        t.pass();
    });
    INVALID_MESSAGES.forEach(invalidMessage => center.sendFromMyFirstDirection(invalidMessage));
});

test('MessageCenter dispatches an event (sendFrom)', t => {
    const center = new (messageCenterFactory(PROTOCOL));
    const MESSAGE = MyFirstDirectionMessages.SAY_HI.create({});
    center.on('message-from-my-first-direction', (message) => {
        t.is(message, MESSAGE);
    });
    center.sendFromMyFirstDirection(MESSAGE);
});

test('MessageCenter redirects a message from "sendFrom" to "processFrom"', async t => {
    const center = new (messageCenterFactory(PROTOCOL));
    const MESSAGE = MyFirstDirectionMessages.SAY_HI.create({});
    class MyController extends controllerFactory(PROTOCOL) {

        /**
         * @override
         */
        public readonly processFromMyFirstDirectionMessageSayHi = async (message: IMessageSayHi) => {
            t.is(message, MESSAGE);
        }

    }
    center.attachController(new MyController(center));
    center.sendFromMyFirstDirection(MESSAGE);
});

test('MessageCenter invokes setUp method on attachment', t => {
    const center = new (messageCenterFactory({}));
    class MyController extends controllerFactory({}) {
        async setUp() {
            t.pass();
        }
    }
    center.attachController(new MyController(center));
});
