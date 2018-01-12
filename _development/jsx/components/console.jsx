import React from 'react';
import store from '../store';

class WebConsole extends React.Component {

  constructor(props) {
    super(props);

    this.app_state = store.getState();
  }

  render() {
    return (
      <div className="web-console">
        <iframe src={"term/webconsole.php?s=" + this.app_state.global.session + "&k=" + this.app_state.global.key} />
      </div>
    );
  }
};

export default WebConsole;