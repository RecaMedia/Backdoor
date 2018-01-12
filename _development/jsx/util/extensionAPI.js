import _ from 'lodash';
import store from '../store';
import mixin from '../mixins/global';

// Private method for API calls.
function callAPI(url, options) {
  let app_state = store.getState();
  let request = new XMLHttpRequest();
  request.open(options.method, url, false);  // `false` makes the request synchronous
  request.setRequestHeader("session", app_state.global.session);
  request.setRequestHeader("bd2-api-key", app_state.global.config.apiKey);
  request.setRequestHeader("member-api-key", app_state.global.key);
  if (options.method == 'POST') {
    request.send(JSON.stringify(options.body));
  } else {
    request.send(null);
  }
  if (request.status === 200) {
    return JSON.parse(request.responseText);
  } else {
    return false;
  }
}

// Extension manager class.
class ExtensionAPI {

  constructor(data_obj) {
    this.data = data_obj;
  }

  extURL() {
    // Get latest app state.
    let app_state = store.getState();
    // Returns path to extension.
    return app_state.global.config.backdoorFullUrl + "/extensions/" + this.data.folder + "/";
  }

  extBasePath() {
    // Get latest app state.
    let app_state = store.getState();
    // Returns path to extension.
    var base_path = app_state.global.config.baseDir.split('/');
    base_path.pop();
    return base_path.join('/') + "/extensions/" + this.data.folder + "/";
  }

  openedFiles() {
    // Get latest app state.
    let app_state = store.getState();
    // Returns path to extension.
    return app_state.files.views;
  }

  currentDir() {
    // Get latest app state.
    let app_state = store.getState();
    // Returns path to extension.
    return app_state.files.activeDir;
  }

  getDirList(use_promise = false) {
    // Get latest app state.
    let app_state = store.getState();
    // Set form object
    let post_items = {
      dir: this.currentDir()
    };
    // Options
    let options = {
      method: 'POST',
      body: post_items
    }
    if (use_promise) {
      // Create promise.
      const callPromise = new Promise((resolve,reject) => {
        // Returns data
        let data = callAPI(app_state.global.config.backdoorFullUrl + '/api/dir/', options);
        if (data) {
          let returnArray = [];
          // Get object properties and push to new array.
          for (let file in data.directory.files) {
            returnArray.push(data.directory.files[file]);
          }
          // Return new array.
          resolve(returnArray);
        } else {
          reject("Call failed.");
        }
      });
      return callPromise;
    } else {
      // Returns data
      let data = callAPI(app_state.global.config.backdoorFullUrl + '/api/dir/', options);
      let returnArray = [];
      if (data) {
        // Get object properties and push to new array.
        for (let file in data.directory.files) {
          returnArray.push(data.directory.files[file]);
        }
      }
      // Return promise
      return returnArray;
    }
  }

  loadFile(file_browser_obj) {
    // Get latest app state.
    let app_state = store.getState();
    // Dispatch to load file.
    let is_open = _.findWhere(app_state.files.views, {viewid: file_browser_obj.path});
    // Check if file is already open.
    if (!is_open) {
      store.dispatch({
        type: "STORE_FILE_OBJECT",
        browserObj: file_browser_obj,
        nextType: "LOAD_FILE",
        headers: app_state.global.headers,
        appUrl: app_state.global.config.backdoorFullUrl
      });
      return true;
    } else {
      store.dispatch({
        type: "STORE_FILE_OBJECT",
        browserObj: file_browser_obj,
        nextType: false
      });
      store.dispatch({
        type: "NOW_ACTIVE",
        viewid: file_browser_obj.path
      });
      return false;
    }
  }

  // store() {
  //   // Get latest app state.
  //   let app_state = store.getState();
  //   // Return state from app minus properties we want extensions accessing.
  //   let edited_state = Object.assign({}, app_state, {
  //     global: _.omit(app_state.global, ['key', 'lastAction', 'session', 'socket', 'headers'])
  //   });
  //   // Return copy.
  //   return edited_state;
  // }
}

export default ExtensionAPI;