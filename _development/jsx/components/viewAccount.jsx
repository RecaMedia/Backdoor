import React from 'react';
import store from '../store';

import AccountForm from './accountForm';

import ErrorBoundary from './errorBoundary';

class ViewAccount extends React.Component {

	constructor(props) {
		super(props);
    
		this.clearView = this.clearView.bind(this);
		
		this.app_state = store.getState();
	}

	clearView() {
		if (typeof this.props.clearView === 'function') {
			this.props.clearView();
		}
	}

	render() {
		return (
			<ErrorBoundary>
				<div className="view-page">
					<h2>
						Account Settings
						<button className="float-right" onClick={() => this.clearView()}>
							<i className="fa fa-close"></i>
						</button>
					</h2>
					<div className="view-page__container">
						<h2 className="spacer">
							Personal Information
						</h2>
						<div className="view-page__wrapper">
							<AccountForm type="update"/>
						</div>
					</div>
				</div>
			</ErrorBoundary>
		)
	}
}

export default ViewAccount;