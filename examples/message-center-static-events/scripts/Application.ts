'use strict';

import { messageCenterFactory } from '@fructo/messaging-framework';


class Application extends messageCenterFactory({}) {

}

const app = new Application();

/**
 * The Application received an unknown or improperly formated message.
 */
app.on('protocol-error', (error) => {

});

/**
 * A message processing method of a controller threw an error.
 */
app.on('controller-error', (error) => {

});

/**
 * A message processing method of a controller returned a value.
 */
app.on('controller-result', (value) => {

});
