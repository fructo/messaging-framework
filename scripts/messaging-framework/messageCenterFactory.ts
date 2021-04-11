'use strict';

import { TMessageCenterEventName } from './dynamic-api/TMessageCenterEventName.js';
import { TCenterProcessingMethodsContainer } from './dynamic-api/center/TCenterProcessingMethodsContainer.js';
import { TCenterSendingMethodsContainer } from './dynamic-api/center/TCenterSendingMethodsContainer.js';
import { createCenterSendingMethodsContainer } from './dynamic-api/center/CenterSendingMethodsContainer.js';
import { createCenterProcessingMethodsContainer } from './dynamic-api/center/CenterProcessingMethodsContainer.js';

import { TMessageCenter, TControllerPublicApi, IControllerClass } from './controllerClassFactory.js';


export function messageCenterFactory<TProtocol>(protocol: TProtocol): IMessageCenterClass<TProtocol> {
    const sendingMethodsContainer = createCenterSendingMethodsContainer(protocol, (methodName, eventName) =>
        function (this: IMessageCenterPrivateStaticApi<TProtocol>, message: unknown) {
            this.dispatchEvent(eventName, message);
        }
    );
    const processingMethodsContainer = createCenterProcessingMethodsContainer(protocol, (methodName, eventName, headersMap) => {
        return function (this: IMessageCenterPrivateStaticApi<TProtocol>, message: unknown) {
            if (typeof message === 'object' && message && message.constructor.name === 'Object' && typeof (message as { header: unknown }).header === 'string') {
                const [messageFactory, processingMethodName] = headersMap.get((message as { header: string }).header) || [];
                if (messageFactory && processingMethodName) {
                    const errors = messageFactory.validate(message);
                    if (errors.length > 0) {
                        this.dispatchEvent('protocol-error', errors);
                        return;
                    }
                    this.dispatchEvent(eventName, message);
                    this.controllers.forEach(controller => {
                        void (async () => {
                            try {
                                await (controller as { [key: string]: (message: unknown) => Promise<void> })[processingMethodName](message);
                            } catch (error) {
                                this.dispatchEvent('controller-error', [error]);
                            }
                        })();
                    });
                    return;
                }
            }
            this.dispatchEvent('protocol-error', [{ description: 'unknown_message', message }]);
        };
    });
    class MessageCenter extends StaticMessageCenter<TProtocol> { }
    Object.assign(MessageCenter.prototype, sendingMethodsContainer);
    Object.assign(MessageCenter.prototype, processingMethodsContainer);
    return MessageCenter as unknown as IMessageCenterClass<TProtocol>;
}


/**
 * This type defines the public API of a message center.
 */
type TMessageCenterPublicApi<TProtocol> = IMessageCenterPublicStaticApi<TProtocol> & TCenterSendingMethodsContainer<TProtocol> & TCenterProcessingMethodsContainer<TProtocol>;


/**
 * This interface contains the definition of the constructor.
 */
export interface IMessageCenterClass<TProtocol> {

    /**
     * Constructs the center.
     * Attaches all controllers defined in {@link StaticMessageCenter.CONTROLLERS}.
     */
    new(): TMessageCenterPublicApi<TProtocol>;

}


/**
 * This interface defines the private statically defined API of a center.
 * 
 * @remarks
 * All methods and properties should be treated as private.
 */
interface IMessageCenterPrivateStaticApi<TProtocol> {

    /**
     * Contains all registered controllers.
     */
    readonly controllers: Array<TControllerPublicApi<TProtocol>>;

    /**
     * Passes an event to specified event listeners.
     */
    dispatchEvent(eventName: TMessageCenterEventName<TProtocol>, event: unknown): void;

}


/**
 * This interface defines the public statically defined API of a message center.
 */
interface IMessageCenterPublicStaticApi<TProtocol> {

    /**
     * Attaches an event listener.
     */
    on(eventName: TMessageCenterEventName<TProtocol>, listener: (message: unknown) => void): void;

    /**
     * Registers a controller.
     */
    attachController(controller: TControllerPublicApi<TProtocol>): void

}


/**
 * This class contains statically defined methods and constructor for the center.
 */
abstract class StaticMessageCenter<TProtocol> implements IMessageCenterPublicStaticApi<TProtocol> {

    /**
     * Contains classes of controllers.
     * Overridable.
     * Presents as an alternative for {@link StaticMessageCenter.attachController}.
     */
    protected static readonly CONTROLLERS: Array<IControllerClass<unknown>> = [];

    /**
     * Contains all registered event listeners.
     */
    private readonly eventsListeners = new Map<TMessageCenterEventName<TProtocol>, Array<(event: unknown) => void>>();

    /**
     * Contains all registered controllers.
     */
    private readonly controllers: Array<TControllerPublicApi<TProtocol>> = [];

    /**
     * Constructs the center.
     * Attaches all controllers defined in {@link StaticMessageCenter.CONTROLLERS}.
     */
    constructor() {
        void this.setUp();
        const staticFields = this.constructor as unknown as { CONTROLLERS: Array<IControllerClass<TProtocol>> };
        staticFields.CONTROLLERS.forEach(controllerClass => {
            const controller = new controllerClass(this as unknown as TMessageCenter<TProtocol>);
            this.attachController(controller);
        });
    }

    /**
     * Overridable method.
     * Can be used to set up the message center.
     * Will be started before the controllers are set up.
     */
    protected async setUp(): Promise<void> {
        // overridable
    }

    /**
     * Passes an event to specified event listeners.
     */
    private dispatchEvent(eventName: TMessageCenterEventName<TProtocol>, event: unknown): void {
        const listeners = this.eventsListeners.get(eventName) || [];
        listeners.forEach(listener => listener(event));
    }

    /**
     * @override
     */
    public on(eventName: TMessageCenterEventName<TProtocol>, listener: (event: unknown) => void): void {
        const listeners = this.eventsListeners.get(eventName) || [];
        listeners.push(listener);
        this.eventsListeners.set(eventName, listeners);
    }

    /**
     * @override
     */
    public attachController(controller: TControllerPublicApi<TProtocol>): void {
        this.controllers.push(controller);
        void controller.setUp();
    }

}
