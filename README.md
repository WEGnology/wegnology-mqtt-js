# WEGnology JavaScript MQTT Client

<!-- [![Build Status](https://travis-ci.com/WEGnology/wegnology-mqtt-js.svg?branch=master)](https://travis-ci.com/WEGnology/wegnology-mqtt-js) -->
[![npm version](https://badge.fury.io/js/wegnology-mqtt.svg)](https://badge.fury.io/js/wegnology-mqtt)

The [WEGnology](https://docs.app.wnology.io) MQTT client provides a simple way for
custom things to communicate with the WEGnology platform over MQTT.  You can
authenticate as a device, publish device state, and listen for device commands.

This client works with Node.js v4.0 and newer. It uses the Node.js [MQTT client](https://github.com/mqttjs/MQTT.js) for all underlying communication.

## Installation

The WEGnology JavaScript MQTT Client is installed using npm.

```bash
npm install wegnology-mqtt
```

## Example

Below is a high-level example of using the WEGnology JavaScript MQTT client to send the value of a temperature sensor to the WEGnology platform.

```javascript
var Device = require('wegnology-mqtt').Device;

// Construct device.
var device = new Device({
  id: 'my-device-id',
  key: 'my-app-access-key',
  secret: 'my-app-access-secret'
});

// Connect to WEGnology.
device.connect();

// Listen for commands.
device.on('command', function(command) {
  console.log('Command received.');
  console.log(command.name);
  console.log(command.payload);
});

// Send temperature once every second.
setInterval(function() {
  device.sendState({ temperature: readAnalogIn() });
}, 1000);
```

<br/>

## API Documentation

* [`Device`](#device)
  * [`device.connect()`](#device-connect)
  * [`device.isConnected()`](#device-isconnected)
  * [`device.sendState()`](#device-sendstate)
  * [`device.disconnect()`](#device-disconnect)
  * [`Event: 'command'`](#device-eventcommand)
  * [`Event: 'connect'`](#device-eventconnect)
  * [`Event: 'reconnect'`](#device-eventreconnect)
  * [`Event: 'reconnected'`](#device-eventreconnected)
  * [`Event: 'close'`](#device-eventclose)
  * [`Event: 'offline'`](#device-eventoffline)
  * [`Event: 'error'`](#device-eventerror)
* [`Gateway`](#gateway)
  * [`gateway.addPeripheral()`](#gateway-addperipheral)
* [`Peripheral`](#peripheral)
  * [`peripheral.sendState()`](#peripheral-sendstate)
  * [`Event: 'command'`](#peripheral-eventcommand)

## Device <a name="device"></a>

A device represents a single thing or widget that you'd like to connect to the WEGnology platform. A single device can contain many different sensors or other attached peripherals. Devices can either report state or respond to commands.

A device's state represents a snapshot of the device at some point in time. If the device has a temperature sensor, it might report state every few seconds with the temperature. If a device has a button, it might only report state when the button is pressed. Devices can report state as often as needed by your specific application.

Commands instruct a device to take a specific action. Commands are defined as a name and an optional payload. For example, if the device is a scrolling marquee, the command might be "update text" and the payload would include the text to update.

```javascript
var Device = require('wegnology-mqtt').Device;

var device = new Device({
  id: 'my-device-id',
  key: 'my-app-access-key',
  secret: 'my-app-access-secret'
  transport: 'tls'
});
```

* `id`: The device's ID. Obtained by first registering a device using the WEGnology platform.
* `key`: The WEGnology access key.
* `secret`: The WEGnology access secret.
* `transport`: The underlying transport mechanism. Supports `tcp`, `tls`, `ws` (WebSocket), and `wss` (Secure WebSocket). Optional. Defaults to `tls`.
* `qosPublish`: The QoS level to use for publishing messages. Defaults to 0. Valid levels are 0 and 1 - QoS level 2 is not supported.
* `mqttEndpoint`: If using a dedicated install of WEGnology, set this to your broker URL. For example `broker.example.com`. Optional. Defaults to `broker.losant.com`.

### device.connect([callback]) <a name="device-connect"></a>

Connects the device to the WEGnology platform. The device will automatically retry any lost connections.
When the connection has been established, the callback is invoked. In the case of a connection error,
the callback will be invoked with the error.
Alternately, listen for the [connect](#device-eventconnect) event to know when a connection has been successfully established.

```javascript
device.connect(function (error) {
  if (error) {
    // Handle error
    throw error;
  }
  // Successfully connected
});
```

### device.isConnected() <a name="device-isconnected"></a>

Returns a boolean indicating whether or not the device is currently connected to the WEGnology platform.

```javascript
device.isConnected();
```

### device.sendState(state, [time], [callback]) <a name="device-sendstate"></a>

Sends a device state to the WEGnology platform. In many scenarios, device states will change rapidly. For example a GPS device will report GPS coordinates once a second or more. Because of this, sendState is typically the most invoked function. Any state data sent to WEGnology is stored and made available in data visualization tools and workflow triggers.

```javascript
// Send the device state to WEGnology.
device.sendState({ voltage: readAnalogIn() });
```

* `state`: The state to send as a JavaScript object.
* `time`: The Date object that the state occurred. Optional. Defaults to `new Date()`.
* `callback`: Invoked when complete. `err` parameter will have details of any errors that occurred. Optional.

### device.disconnect([callback]) <a name="device-disconnect"></a>

Disconnects the device from the WEGnology platform.

```javascript
device.disconnect(function() {
  // Disconnect complete
});
```

### Event: 'command' <a name="device-eventcommand"></a>

```javascript
device.on('command', function(command) { });
```

Emitted whenever a command is received from the WEGnology platform.

* `command.name`: The name of the command received.
* `command.time`: The Date of when the command was originally invoked.
* `command.payload`: The optional payload as a JavaScript object for the command.

### Event: 'connect' <a name="device-eventconnect"></a>

```javascript
device.on('connect', function() { });
```

Emitted on the very first successful connection. All reconnects will emit the 'reconnect' event.

### Event: 'reconnect' <a name="device-eventreconnect"></a>

```javascript
device.on('reconnect', function() { });
```

Emitted by the underlying MQTT client whenever a reconnect starts.

### Event: 'reconnected' <a name="device-eventreconnected"></a>

```javascript
device.on('reconnected', function() { });
```

Emitted by the underlying MQTT client whenever a reconnect succeeds.

### Event: 'close' <a name="device-eventclose"></a>

```javascript
device.on('close', function() { });
```

Emitted by the underlying MQTT client after a disconnection.

### Event: 'offline' <a name="device-eventoffline"></a>

```javascript
device.on('offline', function() { });
```

Emitted by the underlying MQTT client when it goes offline.

### Event: 'error' <a name="device-eventerror"></a>

```javascript
device.on('error', function(err) { });
```

Emitted by the underlying MQTT client when it cannot connect.

* `err`: The error that occurred.

## Gateway <a name="gateway"></a>

The Gateway object extends the Device object, therefore all device functions, properties, and events are available on the gateway.

A gateway works exactly like a device accept that it can also report state and receive commands on behalf of peripherals. Peripherals are things that are not directly connected to WEGnology. For example a Raspberry Pi could be a gateway that is reporting state for one or more Bluetooth peripherals.

```javascript
var Gateway = require('wegnology-mqtt').Gateway;

var gateway = new Gateway({
  id: 'my-device-id',
  key: 'my-app-access-key',
  secret: 'my-app-access-secret'
});

gateway.connect();

// Add a peripheral to the gateway.
var peripheral = gateway.addPeripheral('my-peripheral-id');

// Report the peripheral's state.
// How the gateway communicates to the peripheral (e.g. Bluetooth) is up to
// the specific environment and implementation.
peripheral.sendState({ temperature: myReadPeripheralTemp() });

// Listen for commands sent to peripherals.
peripheral.on('command', function(command) {
  console.log(command.name);
  console.log(command.payload);
  // The gateway can now communicate to the peripheral however needed
  // to complete this command.
});

```

### gateway.addPeripheral(id) <a name="gateway-addperipheral"></a>

Adds a peripheral to the gateway and returns the peripheral instance. The id is a WEGnology device id that is created when the device is added to a WEGnology application. The device must be configured as a peripheral device type when created.

```javascript
var peripheral = gateway.addPeripheral('my-peripheral-id');
```

* `id`: The WEGnology peripheral device id.

## Peripheral <a name="peripheral"></a>

Peripherals device types do not connect directly to WEGnology. Gateways report state and handle commands on their behalf. Peripheral instances are not directly constructed. They are created by calling [`addPeripheral`](#gateway-addperipheral) on the gateway.

```javascript
var Gateway = require('wegnology-mqtt').Gateway;

var gateway = new Gateway({
  id: 'my-device-id',
  key: 'my-app-access-key',
  secret: 'my-app-access-secret'
});

gateway.connect();

// Add a peripheral to the gateway.
var peripheral = gateway.addPeripheral('my-peripheral-id');

// Report the peripheral's state.
// How the gateway communicates to the peripheral (e.g. Bluetooth) is up to
// the specific environment and implementation.
peripheral.sendState({ temperature: myReadPeripheralTemp() });

// Listen for commands sent to peripherals.
peripheral.on('command', function(command) {
  console.log(command.name);
  console.log(command.payload);
  // The gateway can now communicate to the peripheral however needed
  // to complete this command.
});

```

### peripheral.sendState(state, [time], [callback]) <a name="peripheral-sendstate"></a>

Sends a peripheral device's state to the WEGnology platform. In many scenarios, device states will change rapidly. For example a GPS device will report GPS coordinates once a second or more. Because of this, sendState is typically the most invoked function. Any state data sent to WEGnology is stored and made available in data visualization tools and workflow triggers.

```javascript
// Send the device state to WEGnology.
peripheral.sendState({ voltage: myReadPeripheralVoltage() });
```

* `state`: The state to send as a JavaScript object.
* `time`: The Date object that the state occurred. Optional. Defaults to `new Date()`.
* `callback`: Invoked when complete. `err` parameter will have details of any errors that occurred. Optional.

### Event: 'command' <a name="peripheral-eventcommand"></a>

```javascript
peripheral.on('command', function(command) { });
```

Emitted whenever a command is received from the WEGnology platform.

* `command.name`: The name of the command received.
* `command.time`: The Date of when the command was originally invoked.
* `command.payload`: The optional payload as a JavaScript object for the command.

## Debugging

This library uses the [Debug](https://github.com/visionmedia/debug) module for additional debug output. You can enable it by setting the `DEBUG` environment variable to `wegnology*`.

```text
DEBUG=wegnology* node index.js
```

<br/>

## Testing

To execute unit tests, simply run `npm test`.

Integration tests perform operations against live WEGnology devices. In order for these tests to correctly run, the following must be setup:
 * Standalone device with { temperature : Number } attribute.
 * Workflow that triggers on standalone device and sends command back to device.
 * Gateway with { temperature : Number } attribute.
 * Peripheral with { temperature: Number } attribute.

Also, you must create a .mocharc.js file in the project root level and set the following environment variables:

```text
// .mocharc.js file
process.env.STANDALONE_DEVICE_ID = '<standalone-device-id>';
process.env.GATEWAY_DEVICE_ID = '<gateway-device-id>';
process.env.PERIPHERAL_DEVICE_ID = '<peripheral-device-id>';
process.env.ACCESS_KEY = '<access-key>';
process.env.ACCESS_SECRET = '<access-secret>';
```
Once done, just run `npm run integration`
*****

Copyright (c) 2021 WEGnology

<https://docs.app.wnology.io>
