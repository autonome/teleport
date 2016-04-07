

/*

This function originally from:

https://github.com/mozilla-services/firefox-send-tab-to-device

and modified for use here:

* Improved strings
* Added a notification when complete

*/

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function promptAndSendURIToDevice(uri, title) {
  const { Cc, Ci, Cu} = require('chrome');
  Cu.import('resource://services-sync/main.js');
  let clientsEngine = Weave.Service.clientsEngine;
  let remoteClients = clientsEngine._store._remoteClients;
  let promptService = Cc['@mozilla.org/embedcomp/prompt-service;1']
                      .getService(Ci.nsIPromptService);

  // Create lists of remote client names and ids.
  let labels = [];
  let ids = [];
  for (let id in remoteClients) {
    labels.push(remoteClients[id].name);
    ids.push(id);
  }
  labels.push('All devices');
  ids.push(undefined);

  if (labels.length > 1) {
    let selected = {};
    let result = promptService.select(null, 'Send to device...', 'Send \'' + title + '\' to device:',
                                      labels.length, labels, selected);
    if (result) {
      clientsEngine.sendURIToClientForDisplay(uri, ids[selected.value], title);
      clientsEngine.sync();
      notify('Current page sent to device "' + labels[selected.value] + '"')
    }
  } else {
    promptService.alert(null, 'Send to device...', 'You need to first configure Firefox Sync in Preferences before you send URLs to your other devices.');
  }
}

var { Hotkey } = require('sdk/hotkeys');
var showHotKey = Hotkey({
  combo: 'accel-shift-m',
  onPress: function() {
    var activeTab = require('sdk/tabs').activeTab;
    promptAndSendURIToDevice(activeTab.url, activeTab.title);
  }
});

function notify(msg) {
  var notifications = require('sdk/notifications');
  notifications.notify({
    text: msg
  });
}
