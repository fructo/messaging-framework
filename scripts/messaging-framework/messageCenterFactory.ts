'use strict';

import { IMessage } from './message/IMessage.js';
import { IMessageFactory } from './message/IMessageFactory.js';
import { IControllerClass } from './controllerFactory.js';
import { TSendToApi } from './dynamic-api/TSendToApi.js';
import { TSendFromApi } from './dynamic-api/TSendFromApi.js';
import { TControllerPublicApi } from './controllerFactory.js';
import { TProcessFromApi } from './dynamic-api/TProcessFromApi.js';
import { TMessageCenterEventName } from './dynamic-api/TMessageCenterEventName.js';
import { constructSendToApiMethods } from './dynamic-api/SendToApi.js';
import { constructSendFromApiMethods } from './dynamic-api/SendFromApi.js';
import { convertToPascalCase } from './extra/extra-utils.js';


export function messageCenterFactory<Protocol>(protocol: Protocol): IMessageCenterClass<Protocol> {
    const sendToApiMethods = constructSendToApiMethods(protocol, (methodName, eventName) =>
        function (this: IMessageCenterPrivateStaticApi<Protocol>, message) {
            this.dispatchEvent(eventName, message);
        }
    );
    const messagesHeadersMap = constructEventToHeaderToFactoryMap(protocol);
    const sendFromApiMethods = constructSendFromApiMethods(protocol, (methodName, eventName) =>
        function (this: IMessageCenterPrivateStaticApi<Protocol>, message) {
            try {
                const factoriesMap = messagesHeadersMap.get(eventName) || new Map();
                validateMessage(message, factoriesMap);
            } catch (error) {
                this.dispatchEvent('protocol-error', error);
                return;
            }
            this.dispatchEvent(eventName, message);
            const processFromMethodName = constructProcessingMethodName(methodName, message);
            this.controllers.forEach(controller => void (async () => {
                try {
                    const result = await (controller[processFromMethodName] as (message: unknown) => Promise<unknown>)(message);
                    if (result) {
                        this.dispatchEvent('controller-result', result);
                    }
                } catch (error) {
                    this.dispatchEvent('controller-error', error);
                }
            })());
        }
    );
    class MessageCenter extends StaticMessageCenter<Protocol> { }
    Object.assign(MessageCenter.prototype, sendToApiMethods);
    Object.assign(MessageCenter.prototype, sendFromApiMethods);
    return MessageCenter as unknown as IMessageCenterClass<Protocol>;
}


/**
 * @example
 * ```ts
 * class MessagesFactory {
 *   static ECHO_ME = {
 *     create({ greeting }: { greeting: string }): { greeting: string } {
 *       return { greeting }; 
 *     }
 *   }
 * }
 * 
 * const PROTOCOL = {
 *   ALLOWED_MESSAGES_FROM_SOMEWHERE: [MessagesFactory]
 * };
 * 
 * const headersMap = constructEventToHeaderToFactoryMap(PROTOCOL); // => { 'message-from-somewhere': { 'echo-me': <ECHO_ME factory> } }
 * ```
 */
function constructEventToHeaderToFactoryMap<Protocol>(protocol: Protocol): Map<string, Map<string, IMessageFactory<IMessage>>> {
    const headersMap = new Map<string, Map<string, IMessageFactory<IMessage>>>();
    const protocolKeys = Object.keys(protocol).filter(key => key.startsWith('ALLOWED_MESSAGES_FROM_')) as Array<keyof Protocol & string>;
    for (const key of protocolKeys) {
        const eventName = `message-${key.replace('ALLOWED_MESSAGES_', '').replaceAll('_', '-').toLowerCase()}`;
        const factoriesMap = new Map<string, IMessageFactory<IMessage>>();
        const factories = protocol[key] as unknown as Array<{ [key: string]: unknown }>;
        for (const factory of factories) {
            const factoryMessagesKeys = Object.keys(factory).filter(key => key.toUpperCase() === key);
            for (const factoryKey of factoryMessagesKeys) {
                const messageHeader = factoryKey.toLowerCase().replaceAll('_', '-');
                const messageFactory = factory[factoryKey] as IMessageFactory<IMessage>;
                factoriesMap.set(messageHeader, messageFactory);
            }
        }
        headersMap.set(eventName, factoriesMap);
    }
    return headersMap;
}


/**
 * @throws An exception if a message is invalid.
 */
function validateMessage(message: unknown, factoriesMap: Map<string, IMessageFactory<IMessage>>) {
    if (typeof message !== 'object') {
        throw 'Message is not an object';
    }
    if (message === null) {
        throw 'Message cannot be null';
    }
    const messageFactory = factoriesMap.get((message as IMessage).header);
    if (messageFactory) {
        messageFactory.validate(message as IMessage);
    } else {
        throw 'Unknown message';
    }
}


function constructProcessingMethodName<Protocol>(
    sendFromMethodName: keyof TSendFromApi<Protocol>,
    message: unknown
): keyof TProcessFromApi<Protocol> {
    const messageName = convertToPascalCase((message as { header: string }).header, '-');
    const methodName = `processFrom${sendFromMethodName.replace(/^sendFrom/, '')}Message${messageName}`;
    return methodName as keyof TProcessFromApi<Protocol>;
}


/**
 * This type defines the public API of a message center.
 */
type TMessageCenterPublicApi<Protocol> = IMessageCenterPublicStaticApi<Protocol> & TSendToApi<Protocol> & TSendFromApi<Protocol>;


/**
 * This interface contains the definition of the constructor.
 */
interface IMessageCenterClass<Protocol> {

    /**
     * Constructs the center.
     * Attaches all controllers defined in {@link StaticMessageCenter.CONTROLLERS}.
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
     * Contains all registered controllers.
     */
    readonly controllers: Array<TSendToApi<Protocol> & TProcessFromApi<Protocol>>;

    /**
     * Passes an event to specified event listeners.
     */
    dispatchEvent(eventName: TMessageCenterEventName<Protocol>, event: unknown): void;

}


/**
 * This interface defines the public statically defined API of a message center.
 */
interface IMessageCenterPublicStaticApi<Protocol> {

    /**
     * Attaches an event listener.
     */
    on(eventName: TMessageCenterEventName<Protocol>, listener: (message: unknown) => void): void;

    /**
     * Registers a controller.
     */
    attachController(controller: TSendToApi<Protocol>): void

}


/**
 * This class contains statically defined methods and constructor for the center.
 */
abstract class StaticMessageCenter<Protocol> implements IMessageCenterPublicStaticApi<Protocol> {

    /**
     * Contains classes of controllers.
     * Overridable.
     * Presents as an alternative for {@link StaticMessageCenter.attachController}.
     */
    protected static readonly CONTROLLERS: Array<unknown> = [];

    /**
     * Contains all registered event listeners.
     */
    private readonly eventsListeners = new Map<TMessageCenterEventName<Protocol>, Array<(event: unknown) => void>>();

    /**
     * Contains all registered controllers.
     */
    private readonly controllers: Array<TSendToApi<Protocol> & TProcessFromApi<Protocol>> = [];

    /**
     * Constructs the center.
     * Attaches all controllers defined in {@link StaticMessageCenter.CONTROLLERS}.
     */
    constructor() {
        const staticFields = this.constructor as unknown as { CONTROLLERS: Array<IControllerClass<Protocol>> };
        staticFields.CONTROLLERS.forEach(controllerClass => {
            const controller = new controllerClass(this as TSendToApi<Protocol>);
            this.attachController(controller);
        });
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

    /**
     * @override
     */
    public attachController(controller: TControllerPublicApi<Protocol>): void {
        this.controllers.push(controller);
        void controller.setUp();
    }

}
