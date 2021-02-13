'use strict';

import { messageCenterFactory } from '@fructo/messaging-framework';

import { PROTOCOL } from './protocol.js';

import { MyFirstController } from './controllers/MyFirstController.js';


class Application extends messageCenterFactory(PROTOCOL) {

    protected CONTROLLERS = [
        MyFirstController
    ];

}
