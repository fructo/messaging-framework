'use strict';

import { TEventName } from './TEventName.js';


export type TMessageCenterEventName<Protocol> =
    TEventName<Protocol, 'TO'> |
    TEventName<Protocol, 'FROM'> |
    'protocol-error' |
    'controller-error' |
    'controller-result';
