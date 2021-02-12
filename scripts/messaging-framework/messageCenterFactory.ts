'use strict';

import { TSendToApi } from './dynamic-api/TSendToApi.js';
import { TMessageCenterEventName } from './dynamic-api/TMessageCenterEventName.js';
import { constructSendToApiMethods } from './dynamic-api/SendToApi.js';


export function messageCenterFactory<Protocol>(protocol: Protocol): IMessageCenterClass<Protocol> {
    const sendToApiMethods = constructSendToApiMethods(protocol, (methodName, eventName) =>
        function (this: IMessageCenterPrivateStaticApi<Protocol>, message) {
            this.dispatchEvent(eventName, message);
        }
    );
    class MessageCenter extends StaticMessageCenter<Protocol> { }
    Object.assign(MessageCenter.prototype, sendToApiMethods);
    return MessageCenter as unknown as IMessageCenterClass<Protocol>;
}


/**
 * This type defines the public API of a controller.
 */
type TMessageCenterPublicApi<Protocol> = IMessageCenterPublicStaticApi<Protocol> & TSendToApi<Protocol>;


/**
 * This interface contains the definition of the constructor.
 */
interface IMessageCenterClass<Protocol> {

    /**
     * Constructs the center.
     */
    new(): TMessageCenterPublicApi<Protocol>;

}


/**
 * This interface defines the private statically defined API of a center.
 * 
 * @remarks
 * All methods and properties should be treated as private.
 */
interface IMessageCenterPrivateStaticApi<Protocol> {

    /**
     * Passes an event to specified event listeners.
     */
    dispatchEvent(eventName: TMessageCenterEventName<Protocol>, event: unknown): void;

}


/**
 * This interface defines the public statically defined API of a controller.
 */
interface IMessageCenterPublicStaticApi<Protocol> {

    /**
     * Attaches an event listener.
     */
    on(eventName: TMessageCenterEventName<Protocol>, listener: (message: unknown) => void): void;

}


/**
 * This class contains statically defined methods and constructor for the center.
 */
abstract class StaticMessageCenter<Protocol> implements IMessageCenterPublicStaticApi<Protocol> {

    /**
     * Contains all registered event listeners.
     */
    private readonly eventsListeners = new Map<TMessageCenterEventName<Protocol>, Array<(event: unknown) => void>>();

    /**
     * Constructs the center.
     */
    constructor() {

    }

    /**
     * Passes an event to specified event listeners.
     */
    private dispatchEvent(eventName: TMessageCenterEventName<Protocol>, event: unknown): void {
        const listeners = this.eventsListeners.get(eventName) || [];
        listeners.forEach(listener => listener(event));
    }

    /**
     * @override
     */
    public on(eventName: TMessageCenterEventName<Protocol>, listener: (event: unknown) => void): void {
        const listeners = this.eventsListeners.get(eventName) || [];
        listeners.push(listener);
        this.eventsListeners.set(eventName, listeners);
    }

}
