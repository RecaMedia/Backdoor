import React from 'react';
import store from '../store';

import mixin from '../mixins/global';

import ErrorBoundary from './errorBoundary';

class Extension extends React.Component {

  constructor(props) {
    super(props);

    this.app_state = store.getState();

    this.getHTML = this.getHTML.bind(this);
    this.extCall = this.extCall.bind(this);

    // Defaults.
    this.state = {
      pages: null,
      scriptLoaded: false
    }
  }

  componentWillMount() {
    // Set ref ID.
    this.refId = "ext" + this.props.ext.data.namespace;
  }

  componentDidMount() {
    // Get HTML if not yet loaded.
    if (this.state.pages == null) {
      this.getHTML();
    }

    // Subscribe to store updates.
    this.unsubscribe = store.subscribe(() => {
      // Get latest state.
      this.app_state = store.getState();
      // Listen to see if a class has been inserted within the store.
			if (this.app_state.global.lastAction == "INSERT_CLASS") {
        // Set extension object.
        this.setObj(this.app_state);
			}
    });

    // Set extension object.
    this.setObj();
  }

  componentWillUnmount() {
		// Unsubscribe
		this.unsubscribe();
  }

  setObj(app_state = null) {

    // Get app state if not provided.
    if (app_state == null) {
      app_state = store.getState();
    }

    // If extension object exist, then set.
    if (app_state.ext[this.props.ext.data.namespace].ext != undefined) {
      // If class is verified, we bring it into this component for access.
      this.ext = app_state.ext[this.props.ext.data.namespace].ext;
    }
  }
  
  bindButtons() {
    var _self = this;
    // Proceed only if html and script is loaded.
    if (this.state.pages != null && this.refs.content) {
      // Check if class exist.
      if (typeof eval(this.props.ext.data.namespace) === 'function') {
        // Find all button tags within the extension HTML.
        let buttons = this.refs.content.querySelectorAll("button");
        // Loop through all buttons.
        buttons.forEach((btn) => {
          // Grap the method call from the onclick attribute.
          var call = btn.getAttribute("onclick");
          // Remove the onclick attribute since this would call within a different scope.
          btn.removeAttribute("onclick");
          // Bind click event to access extension object.
          btn.addEventListener('click', function(e){
            e.preventDefault();
            _self.extCall(call);
          });
          return btn;
        });
      }
    }
  }

  getHTML() {
    let url = this.app_state.global.config.backdoorFullUrl + '/api/ext/html';

    let formData = new FormData();
    formData.append('extpath', this.props.ext.data.path);

    if (this.props.location == "side") {
      formData.append('panels[]', this.props.ext.data.leftPanel);
    } else {
      formData.append('panels[]', this.props.ext.data.bottomPanel);
    }

		// Get HTML.
		fetch(url, {
			method: 'POST',
      headers: this.app_state.global.headers,
      body: formData
		}).then((response) => {
			return response.json();
		}).then((data) => {
      if (data.success) {
        // Update state with the HTML to render within component.
        this.setState({
          pages: data.html
        });
        // Bind existing buttons now that we have inserted the HTML.
        this.bindButtons();
      }
		}).catch((error) => {
      mixin.processErrors(error);
    });
  }

  extCall(call) {
    let action = 'this.' + call;
    // Call extension's method.
    eval(action);
  }
  
  renderHTML(html) {
    return {
      __html: html
    }
  }

	render() {
    // Temp loading text.
    let node = "Loading...";

    if (this.state.pages != null) {
      // Loaded html.
      node = <div ref="content" ref="content" dangerouslySetInnerHTML={this.renderHTML(this.state.pages[0])}/>
    }

		return (
      <ErrorBoundary>
        <div ref={this.refId} className={"extension extension-" + this.props.ext.data.namespace}>
          {node}
        </div>
      </ErrorBoundary>
		)
	}
}

export default Extension;