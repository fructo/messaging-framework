'use strict';

import { messageCenterClassFactory } from '@fructo/messaging-framework';


class Application extends messageCenterClassFactory({}) {

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
