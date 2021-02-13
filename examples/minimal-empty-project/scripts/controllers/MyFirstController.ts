'use strict';

import { controllerFactory } from '@fructo/messaging-framework';

import { PROTOCOL } from '../protocol.js';


export class MyFirstController extends controllerFactory(PROTOCOL) {

}
