'use strict';

import { messageCenterClassFactory } from '@fructo/messaging-framework';

import { PROTOCOL } from './protocol.js';

import { MyFirstController } from './controllers/MyFirstController.js';


class Application extends messageCenterClassFactory(PROTOCOL) {

    protected CONTROLLERS = [
        MyFirstController
    ];

}
