import React from 'react';
// import $ from 'jquery';
import store from '../store';

class Footer extends React.Component {

	constructor(props) {
		super(props);

		let active_data = this.getActive();
		this.footer = null;

		this.getActive = this.getActive.bind(this);
		this.updateOptions = this.updateOptions.bind(this);

		this.state = {
			current: active_data.current,
			activeDir:  active_data.activeDir
		};
	}

	componentDidMount() {
		var _self = this;
		this.footer = $('#footer');
		this.footer.find('#ToggleBottomPanel').click(function(){
			$('body').toggleClass('show-bottom-panel');
		})

		this.unsubscribe = store.subscribe(() => {
			var listener_active_data = _self.getActive();

			if (this.refs.footer) {
				this.setState({
					current: listener_active_data.current,
					activeDir:  listener_active_data.activeDir
				});
			}
		});
	}

	componentWillUnmount() {
		this.footer.unbind();
		// Unsubscribe
		this.unsubscribe();
	}

	getActive() {
		var current = false;
		var app_state = store.getState();

		app_state.files.views.map((file,i) => {
			if (app_state.files.workingOnView == file.viewid) {
				current = file;
			}
		});

		return {
			current,
			activeDir: app_state.files.activeDir
		}
	}

	updateOptions() {
		var new_options = {};
		new_options.mode = this.footer.find('select[name="mode-selector"]').val();
		new_options.wrap = this.footer.find('select[name="wrap-selector"]').val();

		store.dispatch({
			type: "UPDATE_OPTIONS",
			options: new_options,
			view: this.state.current
		});
	}

	render() {
		var mode = "htmlmixed";
		var wrap = "true";
		if (this.state.current) {
			mode = this.state.current.options.mode;
			wrap = this.state.current.options.wrap;
		}

		return (
			<footer ref="footer" id="footer" role="footer" className="footer">
				<div className="current-dir">
					Active Directory = {"/"+this.state.activeDir}
				</div>
				<div className="mode-selector">
					<div className="mode-selector-title"></div>
					<select name="mode-selector" value={mode} onChange={this.updateOptions}>
						<option value="htmlmixed">htmlmixed</option>
						<option value="coffeescript">coffeescript</option>
						<option value="css">css</option>
						<option value="javascript">javascript</option>
						<option value="jsx">jsx</option>
						<option value="markdown">markdown</option>
						<option value="perl">perl</option>
						<option value="php">php</option>
						<option value="powershell">powershell</option>
						<option value="pug">pug</option>
						<option value="python">python</option>
						<option value="ruby">ruby</option>
						<option value="sass">sass</option>
						<option value="shell">shell</option>
						<option value="sql">sql</option>
						<option value="vb">vb</option>
						<option value="vbscript">vbscript</option>
						<option value="xml">xml</option>
						<option value="yaml">yaml</option>
					</select>
				</div>
				<div className="mode-selector">
					<div className="mode-selector-title"></div>
					<select name="wrap-selector" value={wrap} onChange={this.updateOptions}>
						<option value="true">Wrap</option>
						<option value="false">No Wrap</option>
					</select>
				</div>
				<div className="mode-selector">
					<button id="ToggleBottomPanel"><i className="fa fa-th-large" aria-hidden="true"></i></button>
				</div>
			</footer>
		)
	}
}

export default Footer;