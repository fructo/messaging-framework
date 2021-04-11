'use strict';

import { controllerClassFactory } from '@fructo/messaging-framework';

import { PROTOCOL } from '../protocol.js';


export class MyFirstController extends controllerClassFactory(PROTOCOL) {

}
