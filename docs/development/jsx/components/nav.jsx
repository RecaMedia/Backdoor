import React from 'react';
import store from '../store';

class Nav extends React.Component {

  constructor(props) {
    super(props);

    this.app_state = store.getState();

    this.checkRoute = this.checkRoute.bind(this);
    
    this.state = {
      home: false
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
    if (currentRoute == "/") {
      this.setState({
        home: true
      });
    } else {
      this.setState({
        home: false
      });
    }
  }

  render() {

    return (
      <nav className="nav">
        <div className="container">
          <a data-anchor="welcome" href="#welcome"><img src="/assets/img/bkdr_logo_pro_black.svg" alt="Backdoor Code Editor" className="logo"/></a>
          <div className="menu-wrapper">
            <a id="menubutton" role="button" aria-haspopup="true" aria-controls="menu" className="menu-button"></a>
            <ul id="menu" role="menu" tabIndex="-1" aria-labelledby="menubutton" className="menu">
              <li><a data-anchor="about" href="#about">About BKDR</a></li>
              <li><a data-anchor="features" href="#features">Features</a></li>
              <li><a data-anchor="developers" href="#developers">Developers</a></li>
              <li><a href="/support">Support</a></li>
              <li className="menu-download"><a href="https://github.com/RecaMedia/Backdoor-Release" target="_blank">Download v2.0.3</a></li>
            </ul>
          </div>
        </div>
      </nav>
    )
  }
}

export default Nav;