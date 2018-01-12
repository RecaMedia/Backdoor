import React from 'react';
import store from '../store';

import AccountForm from './accountForm';
import UserManager from './userManager';

import ErrorBoundary from './errorBoundary';

class ViewUsers extends React.Component {
	
	constructor(props) {
		super(props);

		this.clearView = this.clearView.bind(this);
		this.toggleReg = this.toggleReg.bind(this);

		this.state = {
      adduser: false
    }
	}

	componentDidMount() {
		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();
			if (this.app_state.global.lastAction == "USER_SUCCESSFULLY_CREATED") {
				this.setState({
          adduser: false
        })
			}
		});
	}

	componentWillUnmount() {
		// Unsubscribe
		this.unsubscribe();
	}

	clearView() {
		if (typeof this.props.clearView === 'function') {
			this.props.clearView();
		}
	}

	toggleReg() {
    if (this.state.adduser) {
      this.setState({
        adduser: false
      });
    } else {
      this.setState({
        adduser: true
      });
    }
  }

	render() {
		let display;
		let icon;

		if (this.state.adduser) {
			display = <AccountForm/>;
			icon = "fa fa-list";
		} else {
			display = <UserManager/>;
			icon = "fa fa-user-plus";
		}
		
		return (
			<ErrorBoundary>
				<div className="view-page">
					<h2>
						Manage Users
						<button className="float-right" onClick={() => this.clearView()}>
							<i className="fa fa-close"></i>
						</button>
					</h2>
					<div className="view-page__container">
						<h2 className="spacer">
							Accounts
							<button className="float-right" onClick={() => this.toggleReg()}>
								<i className={icon}></i>
							</button>
						</h2>
						<div className="view-page__wrapper">
							{display}
						</div>
					</div>
				</div>
			</ErrorBoundary>
		)
	}
}

export default ViewUsers;