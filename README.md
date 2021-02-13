# messaging-framework

[![Node.js CI](https://github.com/fructo/messaging-framework/workflows/Node.js%20CI/badge.svg)](https://github.com/fructo/messaging-framework/actions)
[![Coverage Status](https://codecov.io/gh/fructo/messaging-framework/branch/main/graph/badge.svg)](https://codecov.io/gh/fructo/messaging-framework/branch/main)

A simple messaging framework that defines the architecture of a modular application.

The project is platform-independent, so it can be used in Node.js (version >= 15), Deno, and web browser environments.

## Overview

### Advantages
- Provides protocol encapsulation by dynamically injecting methods whose names include the direction and header of the message.
- Provides types for the injected methods.

### Disadvantages
- Loss in performance compared to monolithic architectures.
