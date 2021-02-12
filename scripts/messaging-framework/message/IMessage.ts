'use strict';

export interface IMessage {

    /**
     * The header (type) of a message. 
     * 
     * @remarks
     * The header must be lowercase, and words should be separated with a dash.
     */
    readonly header: string;

}
