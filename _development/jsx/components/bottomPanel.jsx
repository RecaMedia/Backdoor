import React from 'react';
import $ from 'jquery';
import 'jquery-ui';
import store from '../store';

import WebConsole from './console';
import Extension from './extension';

class BottomPanel extends React.Component {

  constructor(props) {
    super(props);

		this.app_state = store.getState();
		
		this.defaultViews = [
			{
				icon: "fa-terminal",
				view: <WebConsole/>
			}
		];

    this.state = {
			currentView: 0,
			sidebarViews: this.defaultViews
		}
  }

	componentDidMount() {
		$('#BottomPanelContainer').resizable({
      handles: 'n',
      maxHeight: 350,
      minHeight: 100
		});
		
		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();

			if (this.app_state.global.lastAction == "UPDATE_EXTENSIONS" || this.app_state.global.lastAction == "INSERT_CLASS") {
				this.addExtensions(this.app_state.ext);
			}
    });
    
    this.addExtensions(this.app_state.ext);
  }

  componentWillUnmount() {
		$('#BottomPanelContainer').resizable("destroy");
		// Unsubscribe
		this.unsubscribe();
	}
	
	addExtensions(extensions) {

		let temp_array = [];

		Object.keys(extensions).map((ext, i) => {
			if (extensions[ext].data.active) {
				temp_array.push({
					icon: extensions[ext].data.icon,
					view: <Extension ext={extensions[ext]} location="bottom"/>
				});
			}
    });

		let new_views = this.defaultViews.concat(temp_array);

		this.setState({
			sidebarViews: new_views
		})
	}

	showView(key) {
		this.setState({
			currentView: key
		});
	}

	render() {
		return (
			<div id="BottomPanelContainer" className="bottom-panel">
        <ul>
          {
            this.state.sidebarViews.map((item,i) => {
              return <li key={i}>
                <button onClick={() => this.showView(i)}><i className={"fa " + item.icon} aria-hidden="true"></i></button>
              </li>;
            })
          }
        </ul>
        <div className="bottom-panel__container">
          {
            this.state.sidebarViews.map((item,i) => {
              let showView = "";
              if (this.state.currentView == i) {
                showView = "bottom-panel__container__view--show";
              }
              return <div className={"bottom-panel__container__view " + showView} key={i}>
                {item.view}
              </div>;
            })
          }
        </div>
      </div>
		)
	}
};

export default BottomPanel;