import React from 'react';
import store from '../store';

import Nav from './nav';

class Header extends React.Component {

	constructor(props) {
    super(props);

    this.app_state = store.getState();

    this.checkRoute = this.checkRoute.bind(this);
    
    this.state = {
      content: false,
      className: "header header--not-home"
    }
  }
  
  componentDidMount() {
    this.checkRoute();

    this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();
			if (this.app_state.global.lastAction == "PATHNAME_READY") {
				this.checkRoute();
			}
		});
	}
	
	componentWillUnmount() {
		this.unsubscribe();
	}

  checkRoute() {
    let currentRoute = this.app_state.global.routePath
    if (currentRoute == "/Backdoor/") {
      this.setState({
        content: true,
        className: "header"
      });
    } else {
      this.setState({
        content: false,
        className: "header header--not-home"
      });
    }
  }

	render() {
    var content;

    if (this.state.content) {
      content = <div className="container">
        <div className="header-wrapper">
          <h1 className="header-title">{this.props.title}</h1>
        </div>
      </div>;
    }

		return (
			<header name="welcome" className={this.state.className}>
        <Nav/>
        {content}
      </header>
		)
	}
}

export default Header;