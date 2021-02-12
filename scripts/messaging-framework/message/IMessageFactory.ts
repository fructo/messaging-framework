'use strict';

import { IMessage } from './IMessage.js';


export interface IMessageFactory<Message extends IMessage> {

    /**
     * Message's header.
     */
    readonly header: string;

    /**
     * Constructs a message.
     * 
     * @param properties - Adjustable message properties.
     */
    create(properties: unknown): Message;

    /**
     * Checks if a message has an appropriate type and is valid.
     * 
     * @param message - A message to be checked.
     */
    validate(message: IMessage): void;

}
