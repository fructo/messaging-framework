# Changelog

## [1.0.0-alpha.2] - 2020-04-11
### Changed
- Rename `messageCenterFactory` to `messageCenterClassFactory`.
- Rename `controllerFactory` to `controllerClassFactory`.

## [1.0.0-alpha.1] - 2020-04-08
### Added
- Center:
  - Overridable protected method `setUp`.

## [1.0.0-alpha.0] - 2020-04-08
### Added
- Controller:
  - Overridable asynchronous `setUp` method.
  - Dynamic properties that begin with the word `sendTo`. These functions redirect messages to the message center.
  - Overridable dynamic properties that begin with the word `processFrom`. These functions receive messages from the message center.
- Center:
  - Overridable static property `CONTROLLERS`. Can be used to specify controller classes.
  - Method `attachController`.
  - Dynamic methods that begin with the word `sendTo`. These functions redirect messages to other directions.
  - Dynamic methods that begin with the word `processFrom`. These functions pass a message to the message center.
  - Events:
    - `controller-error`
    - `protocol-error`
    - Dynamic events that begin with the word `message-to` or the word `message-from`.
