/**
 * Basic example of connecting to the WEGnology platform.
 *
 * Copyright (c) 2021 WEGnology IoT, Inc. All rights reserved.
 * https://docs.app.wnology.io
 *
 */

/* eslint no-console: "off"*/

var Device = require('wegnology-mqtt').Device;

// Construct a device instance.
var device = new Device({
  id: 'my-device-id',
  key: 'my-access-key',
  secret: 'my-access-secret'
});

// Connect device to WEGnology.
device.connect();


// Attach event listener for commands.
device.on('command', function(command) {
  console.log(command.name);
  console.log(command.payload);
});

// Once a second, report state to WEGnology.
setInterval(function() {

  // Report state to WEGnology.
  if(device.isConnected()) {
    device.sendState({ key: 'value' });
  }

}, 1000);
