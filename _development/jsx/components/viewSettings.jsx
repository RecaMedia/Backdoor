import React from 'react';
import store from '../store';

import InputText from './inputText';
import InputCheckbox from './inputCheckbox';

import mixin from '../mixins/global';

import ErrorBoundary from './errorBoundary';

class ViewSettings extends React.Component {

	constructor(props) {
		super(props);

		this.clearView = this.clearView.bind(this);
		this.updateForm = this.updateForm.bind(this);

		this.app_state = store.getState();
		this.update_timer = null;

		this.state = {
			socket_url: this.app_state.global.settings.socket_url,
			bkdr_open_reg: this.app_state.global.settings.bkdr_open_reg,
			bkdr_send_errors: this.app_state.global.settings.bkdr_send_errors,
			bkdr_check_updates: this.app_state.global.settings.bkdr_check_updates
		}
	}

	clearView() {
		if (typeof this.props.clearView === 'function') {
			this.props.clearView();
		}
	}

	updateForm(input_state) {
		this.setState(input_state);

		clearTimeout(this.update_timer);

		this.update_timer = setTimeout(() => {
			let type = Object.keys(input_state)[0];
			let value = input_state[type];
	
			let url = this.app_state.global.config.backdoorFullUrl + '/api/settings/update/';
	
			let formData = new FormData();
			formData.append('type',type);
			formData.append('value',value);
			
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
						type: "SET_SETTINGS",
						settings: data.settings
					});
				}
	
				store.dispatch({
					type: "ALERT",
					message: data.statusMessage
				})
			}).catch((error) => {
				mixin.processErrors(error);
			});
		}, 300);
	}

	render() {
		return (
			<ErrorBoundary>
				<div className="view-page">
					<h2>
						Settings
						<button className="float-right" onClick={() => this.clearView()}>
							<i className="fa fa-close"></i>
						</button>
					</h2>
					<div className="view-page__container">
						<div className="view-page__wrapper form">
							<div className="row">
								<div className="col-xs-12 col-sm-6">
									<h2 className="spacer">
										Collaborative Setup
									</h2>
									<InputText title="Socket.io URL" name="socket_url" value={this.state.socket_url} handleChange={this.updateForm}/>
								</div>
								<div className="col-xs-12 col-sm-6">
									<h2 className="spacer">
										General
									</h2>
									<InputCheckbox title="Allow Open Registration" name="bkdr_open_reg" value={this.state.bkdr_open_reg} handleChange={this.updateForm}/>
									<InputCheckbox title="Send Errors Anonymously" name="bkdr_send_errors" value={this.state.bkdr_send_errors} handleChange={this.updateForm}/>
									<InputCheckbox title="Auto Check for Updates" name="bkdr_check_updates" value={this.state.bkdr_check_updates} handleChange={this.updateForm}/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</ErrorBoundary>
		)
	}
}

export default ViewSettings;