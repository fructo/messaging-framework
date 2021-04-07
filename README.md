# messaging-framework

[![ci](https://github.com/fructo/messaging-framework/workflows/ci/badge.svg)](https://github.com/fructo/messaging-framework/actions)
[![Coverage Status](https://codecov.io/gh/fructo/messaging-framework/branch/main/graph/badge.svg)](https://codecov.io/gh/fructo/messaging-framework/branch/main)

[>>Issue Tracker<<](https://github.com/fructo/fructo/issues)

A simple messaging framework that defines the architecture of a modular application.

The project is platform-independent, so it can be used in Node.js (version >= 15), Deno, and web browser environments.

## Overview

### Advantages
- Provides protocol encapsulation by dynamically injecting methods whose names include the direction and header of the message.
- Provides types for the injected methods.

### Disadvantages
- Loss in performance compared to monolithic architectures.

## API

### Message Center
#### static
|||
| --- | --- |
| **Syntax**      | center.attachController(controller)
| **Description** | Attaches a controller to the message center.
| **Events**      | -

|||
| --- | --- |
| **Syntax**      | center.on(eventName, listener)
| **Description** | Attaches an event listener to the message center.
| **Events**      | -

#### dynamic
|||
| --- | --- |
| **Syntax**      | center.sendTo`DirectionInPascalCase`Message`MessageHeaderInPascalCase`(message)
| **Description** | Forwards a message to a specified direction.
| **Events**      | `message-to-{direction}`

|||
| --- | --- |
| **Syntax**      | center.sendFrom`DirectionInPascalCase`(message)
| **Description** | Validates and forwards a message received from a specified direction to controllers.
| **Events**      | `message-from-{direction}`, `protocol-error`, `controller-error`, `controller-result`

### Controller
#### static
|||
| --- | --- |
| **Syntax**      | controller.setUp()
| **Description** | This overridable method is triggered on attachment.
| **Events**      | -

#### dynamic
|||
| --- | --- |
| **Syntax**      | controller.sendTo`DirectionInPascalCase`Message`MessageHeaderInPascalCase`(message)
| **Description** | Forwards a message to a specified direction.
| **Events**      | `message-to-{direction}`

|||
| --- | --- |
| **Syntax**      | controller.processFrom`DirectionInPascalCase`Message`MessageHeaderInPascalCase`(message)
| **Description** | This overridable method is triggered if a specified message from a specified direction is received.
| **Events**      | -
