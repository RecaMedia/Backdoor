import React from 'react';
import store from '../store';

import InputText from './inputText';
import InputCheckbox from './inputCheckbox';

import mixin from '../mixins/global';

import ErrorBoundary from './errorBoundary';

class InstallForm extends React.Component {

  constructor(props) {
    super(props);
    
    this.updateForm = this.updateForm.bind(this);

    this.app_state = store.getState();

    // Set defaults.
    let bkdr_dir = window.location.pathname.trim().replace(/^\/|\/$/g, '').split("/"); // Remove first & last slash, then turn into an array.
    bkdr_dir = bkdr_dir[bkdr_dir.length-1]; // Get last path from pathname.
    let domain_pointed = (bkdr_dir==""?true:false); // If blank, we can assume domain is pointed to app.
    bkdr_dir = (domain_pointed?"bkdr":bkdr_dir); // If pointed, we make bkdr the default which will be the default name of the bkdr app.
    let local_api_key = new Date;
    local_api_key = local_api_key.getTime();
    let domain = window.location.protocol +'//'+ window.location.hostname + window.location.pathname;
    domain = domain.trim().replace(/^\/|\/$/g, '');

    this.state = {
      installComplete: false,
      errors: {
        local_api_key: false,
        default_email: false,
        bkdr_dir: false,
        domain: false
      },
      local_api_key,
      default_email: "",
      bkdr_dir,
      root_dir: "",
      domain,
      domain_pointed,
      bkdr_open_reg: false,
      bkdr_send_errors: true
    }
  }

  updateForm(input_value) {
		this.setState(input_value);
  }

  install(e) {
    e.preventDefault();
    let errors = false;
    let errorCollection = this.state.errors;

    if (this.state.local_api_key == "") {
      errorCollection.local_api_key = true;
      errors = true;
    }

    if (this.state.default_email == "") {
      errorCollection.default_email = true;
      errors = true;
    }

    if (this.state.bkdr_dir == "") {
      errorCollection.bkdr_dir = true;
      errors = true;
    }

    if (this.state.domain == "") {
      errorCollection.domain = true;
      errors = true;
    }

    this.setState({
      errors: errorCollection
    });

    if (!errors) {
      var form_data = new FormData();
      form_data.append("local_api_key", this.state.local_api_key);
      form_data.append("default_email", this.state.default_email);
      form_data.append("bkdr_dir", this.state.bkdr_dir);
      form_data.append("root_dir", this.state.root_dir);
      form_data.append("domain", this.state.domain);
      form_data.append("domain_pointed", this.state.domain_pointed);
      form_data.append("bkdr_open_reg", this.state.bkdr_open_reg);
      form_data.append("bkdr_send_errors", this.state.bkdr_send_errors);

      fetch('api/install.php',{
        method: 'POST',
        body: form_data
      }).then((response) => {
        return response.json();
      }).then((data) => {
        if (data.success) {
          this.setState({
            installComplete: true,
            statusMessage: data.statusMessage
          });
        } else {
          store.dispatch({
            type: "ALERT",
            message: data.statusMessage
          });
        }
      }).catch((error) => {
        mixin.processErrors(error);
      });
    }
  }

  render() {
    var content;
    if (this.state.installComplete) {
      content = <div className="row">
        <div className="col-xs-12 center-text">
          <img className="install-logo" src={'assets/img/bkdr_fullname_black.svg'}/>
          <p>{this.state.statusMessage}</p>
          <p>Reload page to access sign-in form.</p>
        </div>
      </div>
    } else {
      content = <form className="form" onSubmit={(e) => this.install(e)}>
        <div className="row">
          <div className="col-xs-12 center-text">
            <img className="install-logo" src={'assets/img/bkdr_fullname_black.svg'}/>
            <h1>Installation Form</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-sm-6">
            <InputText title="Default Email *" name="default_email" value={this.state.default_email} handleChange={this.updateForm} error={this.state.errors.default_email}/>
          </div>
          <div className="col-xs-12 col-sm-6">
            <InputText title="Domain *" name="domain" value={this.state.domain} handleChange={this.updateForm} error={this.state.errors.domain}/>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-sm-6">
            <InputText title="Backdoor Directory *" name="bkdr_dir" value={this.state.bkdr_dir} handleChange={this.updateForm} error={this.state.errors.bkdr_dir}/>
          </div>
          <div className="col-xs-12 col-sm-6">
            <InputText title="Root Directory" name="root_dir" value={this.state.root_dir} handleChange={this.updateForm} required={false}/>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-sm-6">
            <InputCheckbox title="Domain is pointed to Backdoor app" name="domain_pointed" value={this.state.domain_pointed} handleChange={this.updateForm}/>
          </div>
          <div className="col-xs-12 col-sm-6">
            <InputCheckbox title="Allow Open Registration" name="bkdr_open_reg" value={this.state.bkdr_open_reg} handleChange={this.updateForm}/>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-sm-6">
            <InputCheckbox title="Send Errors Anonymously" name="bkdr_send_errors" value={this.state.bkdr_send_errors} handleChange={this.updateForm}/>
          </div>
        </div>
        <br/>
        <div className="row">
          <div className="col-xs-12">
            <div className="group center">
              <button className="form-button" type="submit">Install</button>
            </div>
          </div>
        </div>
      </form>;
    }

    return (
      <ErrorBoundary>
        {content}
      </ErrorBoundary>
    )
  }
}

export default InstallForm;