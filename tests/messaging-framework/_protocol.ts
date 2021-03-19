'use strict';

import { IMessage } from '@fructo/messaging-framework';


export interface IMessageSayHi extends IMessage {

}

export class MyFirstDirectionMessages {

    public static SAY_HI = {
        create(messageBase: Partial<IMessageSayHi>): IMessageSayHi {
            return { header: 'say-hi', ...messageBase };
        },
        validate(message: unknown): Array<unknown> {
            if (!(typeof message === 'object' && (message as IMessage).header === 'say-hi')) {
                return [{}];
            }
            return [];
        }
    }

}

export interface IMessageEcho extends IMessage {

}

export class MySecondDirectionMessages {

    public static ECHO = {
        create(messageBase: Partial<IMessageEcho>): IMessageEcho {
            return { header: 'echo', ...messageBase };
        },
        validate(message: unknown): Array<unknown> {
            if (!(typeof message === 'object' && (message as IMessage).header === 'echo')) {
                return [{}];
            }
            return [];
        }
    }

}

export const PROTOCOL = {

    ALLOWED_MESSAGES_TO_MY_FIRST_DIRECTION: [MyFirstDirectionMessages],
    ALLOWED_MESSAGES_FROM_MY_FIRST_DIRECTION: [MyFirstDirectionMessages],

    ALLOWED_MESSAGES_FROM_MY_SECOND_DIRECTION: [MySecondDirectionMessages]

};
