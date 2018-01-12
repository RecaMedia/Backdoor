import React from 'react';
import store from '../store';

class FileTab extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = store.getState();

		this.setActive = this.setActive.bind(this);
		this.removeFile = this.removeFile.bind(this);

		this.state = {
			actives: this.app_state.files.actives,
			multiView: this.app_state.files.multiView
		}
	}

	componentDidMount() {
		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();

			if (this.refs.thisTab) {
				this.setState({
					actives: this.app_state.files.actives,
					multiView: this.app_state.files.multiView
				});
			}
		});
	}

	componentWillUnmount() {
		// Unsubscribe
		this.unsubscribe();
	}

	setActive() {
		store.dispatch({
			type: "NOW_ACTIVE",
			viewid: this.props.id
		});
	}

	removeFile() {
		store.dispatch({
			type: "REMOVE_FILE",
			viewid: this.props.id
		});
	}

	render() {
		var className = "";
		var style = {};
		if (this.state.multiView) {
			this.state.actives.map((viewid,i) => {
				if (viewid == this.props.id) {
					className = "view-tabs--selected";
					style = {
						borderColor: this.app_state.global.config.multiViewColors[i],
					}
				}
			});
		} else if (this.props.active) {
			className = "view-tabs--selected";
		}

		return (
			<li ref="thisTab" data-id={this.props.id} className={className} style={style}>
				<button className="draggable" onClick={() => this.setActive()}>{this.props.filename}</button>
				<button className="draggable" onClick={() => this.removeFile()}><i className="fa fa-close"></i></button>
			</li>
		)
	}
}

export default FileTab;