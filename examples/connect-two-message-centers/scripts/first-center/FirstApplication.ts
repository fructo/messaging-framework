'use strict';

import { messageCenterFactory } from '@fructo/messaging-framework';

import { PROTOCOL } from './protocol.js';


export class FirstApplication extends messageCenterFactory(PROTOCOL) {

}
