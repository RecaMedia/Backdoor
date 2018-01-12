import React from 'react';

import mixin from '../mixins/global';

class ErrorBoundary extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({
      hasError: true
    });
    
    // Log the error to an error reporting service
    let errorObj = {
      error,
      info
    }

    mixin.processErrors(errorObj);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h4>Error</h4>
          <p>We've ran into an error. If you have your settings to allow anonymous error logging, then your error has been logged and will help improve the Backdoor web application.</p>
        </div>
      )
    }
    return this.props.children;
  }
}

export default ErrorBoundary;