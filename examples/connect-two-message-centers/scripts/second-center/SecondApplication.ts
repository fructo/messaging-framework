'use strict';

import { messageCenterFactory } from '@fructo/messaging-framework';

import { PROTOCOL } from './protocol.js';

import { FirstApplication } from '../first-center/FirstApplication.js';


class SecondApplication extends messageCenterFactory(PROTOCOL) {

}

const firstApp = new FirstApplication();
const secondApp = new SecondApplication();

firstApp.on('message-to-second-application', (message) => {
    secondApp.processFromFirstApplication(message);
});

secondApp.on('message-to-first-application', (message) => {
    firstApp.processFromSecondApplication(message);
});
