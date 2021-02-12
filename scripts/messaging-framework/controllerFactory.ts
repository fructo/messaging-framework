'use strict';

import { TSendToApi } from './dynamic-api/TSendToApi.js';
import { TProcessFromApi } from './dynamic-api/TProcessFromApi.js';
import { constructSendToApiMethods } from './dynamic-api/SendToApi.js';
import { constructProcessFromApiMethods } from './dynamic-api/ProcessFromApi.js';


export function controllerFactory<Protocol>(protocol: Protocol): IControllerClass<Protocol> {
    const processFromApiMethods = constructProcessFromApiMethods(protocol, (methodName) =>
        function (this: IControllerPrivateStaticApi<Protocol>, ...args: Array<unknown>) {

        }
    );
    const sendToApiMethods = constructSendToApiMethods(protocol, (methodName,) =>
        function (this: IControllerPrivateStaticApi<Protocol>, ...args: Array<unknown>) {
            const method = this.center[methodName] as unknown as (...args: Array<unknown>) => void;
            method(...args);
        }
    );
    class Controller extends StaticController<Protocol> { }
    Object.assign(Controller.prototype, processFromApiMethods);
    Object.assign(Controller.prototype, sendToApiMethods);
    return Controller as unknown as IControllerClass<Protocol>;
}


/**
 * This type defines the public API of a controller.
 */
type TControllerPublicApi<Protocol> = IControllerPublicStaticApi & TProcessFromApi<Protocol> & TSendToApi<Protocol>;


/**
 * This type represents the message center.
 */
type TMessageCenter<Protocol> = TSendToApi<Protocol>;


/**
 * This interface contains the definition of the constructor.
 */
interface IControllerClass<Protocol> {

    /**
     * Constructs the controller.
     * 
     * @param center - The message center.
     */
    new(center: TMessageCenter<Protocol>): TControllerPublicApi<Protocol>;

}


/**
 * This interface defines the private statically defined API of a controller.
 * 
 * @remarks
 * All methods and properties should be treated as private.
 */
interface IControllerPrivateStaticApi<Protocol> {

    /**
     * The message center.
     */
    center: TMessageCenter<Protocol>

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
abstract class StaticController<Protocol> implements IControllerPublicStaticApi {

    /**
     * Constructs the base part of a controller.
     * 
     * @param center - The message center.
     */
    constructor(
        private readonly center: TMessageCenter<Protocol>
    ) { }

    /**
     * @override
     */
    public async setUp(): Promise<void> {

    }

}
