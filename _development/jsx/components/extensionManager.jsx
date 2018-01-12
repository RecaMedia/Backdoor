import React from 'react';
import store from '../store';
import Script from 'react-load-script';
import ExtensionAPI from '../util/extensionAPI';

import mixin from '../mixins/global';

import ErrorBoundary from './errorBoundary';

class ExtLI extends React.Component {

  constructor(props) {
    super(props);

    this.app_state = store.getState();

    this.handleScriptCreate = this.handleScriptCreate.bind(this);
    this.handleScriptError = this.handleScriptError.bind(this);
    this.handleScriptLoad = this.handleScriptLoad.bind(this);

    this.state = {
      scriptLoaded: false,
      scriptError: false
    }
  }

  componentWillMount() {
    // Get extension folder.
    let ext_folder = this.props.ext.path.substr(this.props.ext.path.lastIndexOf('/') + 1);
    this.ext_folder = ext_folder.substr(ext_folder.lastIndexOf('\\') + 1);
    // Make this available within the component.
    this.src = this.app_state.global.config.backdoorFullUrl + '/extensions/' + this.ext_folder + '/' + this.props.ext.script + "?" + Date.now();
  }

  handleScriptCreate() {
    this.setState({scriptLoaded: false});
  }
   
  handleScriptError() {
    this.setState({scriptError: true});
  }
   
  handleScriptLoad() {

    if (this.props.ext.active) {
      let data = Object.assign({}, this.props.ext, {
        folder: this.ext_folder
      });
      
      // Init extension API.
      const api = new ExtensionAPI(data);
      // Pass in API via extensions constructor.
      // Set 'ext' as the extension object which the html will have access to.
      const ext = new (eval(this.props.ext.namespace))(api);

      store.dispatch({
        type: "INSERT_CLASS",
        namespace: this.props.ext.namespace,
        ext
      });
    }
  }

  toggleExt() {
    if (typeof this.props.toggleExt === "function") {
      this.props.toggleExt(this.props.extKey);
    }
  }

  removeExt() {
    if (typeof this.props.toggleExt === "function") {
      this.props.removeExt(this.props.extKey);
    }
  }

	render() {

    let script;

    if (this.props.ext.active) {
      script = <Script
        url={this.src}
        onCreate={this.handleScriptCreate.bind(this)}
        onError={this.handleScriptError.bind(this)}
        onLoad={this.handleScriptLoad.bind(this)}
      />;
    }
    
		return (
      <li className="extension-manager__item">
        {script}
        <p>
          <strong>{this.props.ext.name}</strong><br/>
          {this.props.ext.description}
        </p>
        <button onClick={() => this.toggleExt()}>{this.props.ext.active?"Deactivate":"Activate"}</button>
        <button onClick={() => this.removeExt()}>Remove</button>
        <a href={this.props.ext.url} target="_blank">Author</a>
      </li>
		)
	}
}

class ExtensionManager extends React.Component {

  constructor(props) {
    super(props);

    this.app_state = store.getState();

    this.toggleExt = this.toggleExt.bind(this);
    this.removeExt = this.removeExt.bind(this);

    this.state = {
      extlist: []
    }
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();

			if (this.app_state.global.lastAction == "UPDATE_EXTENSIONS") {
				this.prepareList(this.app_state.ext);
			}
    });
    
    this.prepareList(this.app_state.ext);
  }

  componentWillUnmount() {
		// Unsubscribe
		this.unsubscribe();
  }
  
  toggleExt(key) {
    this.app_state = store.getState();
    let url = this.app_state.global.config.backdoorFullUrl + '/api/ext/toggle';
    let ns = this.app_state.ext[key].data.namespace;
    let tg = this.app_state.ext[key].data.active;
    let ep = this.app_state.ext[key].data.path;

    let formData = new FormData();
    formData.append('namespace', ns);
    formData.append('toggle', tg);
    formData.append('extpath', ep);

		// Get dir data
		fetch(url, {
			method: 'POST',
      headers: this.app_state.global.headers,
      body: formData
		}).then((response) => {
			return response.json();
		}).then(function(data) {
      if (data.success) {
        store.dispatch({
          type: "UPDATE_EXTENSIONS",
          extlist: data.extensions
        });
      }
      store.dispatch({
        type: "ALERT",
        message: data.statusMessage
      });
		}).catch((error) => {
      mixin.processErrors(error);
    });
  }
  
  removeExt(key) {
    this.app_state = store.getState();
    let url = this.app_state.global.config.backdoorFullUrl + '/api/ext/remove';
    let ns = this.app_state.ext[key].data.namespace;
    let ep = this.app_state.ext[key].data.path;

    let formData = new FormData();
    formData.append('namespace', ns);
    formData.append('extpath', ep);

		// Get dir data
		fetch(url, {
			method: 'POST',
      headers: this.app_state.global.headers,
      body: formData
		}).then((response) => {
			return response.json();
		}).then(function(data) {
      if (data.success) {
        store.dispatch({
          type: "UPDATE_EXTENSIONS",
          extlist: data.extensions
        });
      }
      store.dispatch({
        type: "ALERT",
        message: data.statusMessage
      });
		}).catch((error) => {
      mixin.processErrors(error);
    });
	}

  prepareList(extensions) {
    this.setState({
      extlist: extensions
    });
  }

	render() {

    let ext_list = Object.keys(this.state.extlist);
    let extensions = <p>No extensions available.</p>;
    
    if (ext_list.length) {
      extensions = ext_list.map((ext, i) => {
        return <ExtLI key={i} ext={this.state.extlist[ext].data} extKey={ext} toggleExt={this.toggleExt} removeExt={this.removeExt}/>
      });
    }

		return (
      <ErrorBoundary>
        <ul className="extension-manager">
          {extensions}
        </ul>
      </ErrorBoundary>
		)
	}
}

export default ExtensionManager;