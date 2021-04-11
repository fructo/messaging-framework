'use strict';

import { TControllerProcessingMethodsContainer } from './dynamic-api/controller/TControllerProcessingMethodsContainer.js';
import { TControllerSendingMethodsContainer } from './dynamic-api/controller/TControllerSendingMethodsContainer.js';
import { createControllerProcessingMethodsContainer } from './dynamic-api/controller/ControllerProcessingMethodsContainer.js';
import { createControllerSendingMethodsContainer } from './dynamic-api/controller/ControllerSendingMethodsContainer.js';

import { TCenterSendingMethodsContainer } from './dynamic-api/center/TCenterSendingMethodsContainer.js';
import { createCenterSendingMethodName } from './dynamic-api/center/CenterSendingMethodsContainer.js';


export function controllerClassFactory<TProtocol>(protocol: TProtocol): IControllerClass<TProtocol> {
    const processingMethodsContainer = createControllerProcessingMethodsContainer(protocol, () =>
        function (this: IControllerPrivateStaticApi<TProtocol>, message: unknown) {
            // This method should be empty because it is overridable.
        }
    );
    const sendingMethodsContainer = createControllerSendingMethodsContainer(protocol, (direction, messageFactory) => {
        const centerSendingMethodName = createCenterSendingMethodName<TProtocol>(direction);
        return function (this: IControllerPrivateStaticApi<TProtocol>, rawMessage: unknown) {
            const message = messageFactory.create(rawMessage);
            this.center[centerSendingMethodName](message);
        };
    });
    class Controller extends StaticController<TProtocol> { }
    Object.assign(Controller.prototype, processingMethodsContainer);
    Object.assign(Controller.prototype, sendingMethodsContainer);
    return Controller as unknown as IControllerClass<TProtocol>;
}


/**
 * This type defines the public API of a controller.
 */
export type TControllerPublicApi<TProtocol> = IControllerPublicStaticApi & TControllerProcessingMethodsContainer<TProtocol> & TControllerSendingMethodsContainer<TProtocol>;


/**
 * This type represents the message center.
 */
export type TMessageCenter<TProtocol> = TCenterSendingMethodsContainer<TProtocol>;


/**
 * This interface contains the definition of the constructor.
 */
export interface IControllerClass<TProtocol> {

    /**
     * Constructs the controller.
     * 
     * @param center - The message center.
     */
    new(center: TMessageCenter<TProtocol>): TControllerPublicApi<TProtocol>;

}


/**
 * This interface defines the private statically defined API of a controller.
 * 
 * @remarks
 * All methods and properties should be treated as private.
 */
interface IControllerPrivateStaticApi<TProtocol> {

    /**
     * The message center.
     */
    center: TMessageCenter<TProtocol>

}


/**
 * This interface defines the public statically defined API of a controller.
 */
export interface IControllerPublicStaticApi {

    /**
     * Overridable method. Can be used to set up a controller.
     * 
     * This method is going to be invoked on attachment.
     */
    setUp(): Promise<void>;

}


/**
 * This class contains statically defined methods and constructor for the controllers.
 */
abstract class StaticController<TProtocol> implements IControllerPublicStaticApi {

    /**
     * Constructs the base part of a controller.
     * 
     * @param center - The message center.
     */
    constructor(
        private readonly center: TMessageCenter<TProtocol>
    ) { }

    /**
     * @override
     */
    public async setUp(): Promise<void> {

    }

}
