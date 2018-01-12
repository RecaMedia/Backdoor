import React from 'react';
import store from '../store';
import CodeMirror from 'react-codemirror2';

import ErrorBoundary from './errorBoundary';

var JsDiff = require('diff');

// Codemirror Dialog & Search
import '../../../node_modules/codemirror/addon/dialog/dialog';
import '../../../node_modules/codemirror/addon/search/jump-to-line';
import '../../../node_modules/codemirror/addon/search/match-highlighter';
import '../../../node_modules/codemirror/addon/search/matchesonscrollbar';
import '../../../node_modules/codemirror/addon/search/search';
import '../../../node_modules/codemirror/addon/search/searchcursor';

// Codemirror Hints
import '../../../node_modules/codemirror/addon/hint/anyword-hint';
import '../../../node_modules/codemirror/addon/hint/css-hint';
import '../../../node_modules/codemirror/addon/hint/html-hint';
import '../../../node_modules/codemirror/addon/hint/javascript-hint';
import '../../../node_modules/codemirror/addon/hint/show-hint';
import '../../../node_modules/codemirror/addon/hint/sql-hint';
import '../../../node_modules/codemirror/addon/hint/xml-hint';

// Codemirror Themes
import '../../../node_modules/codemirror/mode/coffeescript/coffeescript';
import '../../../node_modules/codemirror/mode/css/css';
import '../../../node_modules/codemirror/mode/htmlmixed/htmlmixed';
import '../../../node_modules/codemirror/mode/javascript/javascript';
import '../../../node_modules/codemirror/mode/jsx/jsx';
import '../../../node_modules/codemirror/mode/markdown/markdown';
import '../../../node_modules/codemirror/mode/perl/perl';
import '../../../node_modules/codemirror/mode/php/php';
import '../../../node_modules/codemirror/mode/powershell/powershell';
import '../../../node_modules/codemirror/mode/pug/pug';
import '../../../node_modules/codemirror/mode/python/python';
import '../../../node_modules/codemirror/mode/ruby/ruby';
import '../../../node_modules/codemirror/mode/sass/sass';
import '../../../node_modules/codemirror/mode/shell/shell';
import '../../../node_modules/codemirror/mode/sql/sql';
import '../../../node_modules/codemirror/mode/vb/vb';
import '../../../node_modules/codemirror/mode/vbscript/vbscript';
import '../../../node_modules/codemirror/mode/xml/xml';
import '../../../node_modules/codemirror/mode/yaml/yaml';

class File extends React.Component {

	constructor(props) {
		super(props);

		this.app_state = store.getState();

		this.socket = this.app_state.global.socket;
		this.connected = false;
		this.updateTimer = null;

		this.contextMenu = this.contextMenu.bind(this);
		this.getCode = this.getCode.bind(this);
		this.updateCode = this.updateCode.bind(this);

		this.p = this.props;

		this.state = {
			authorId: this.app_state.user.instanceId,
			code: "",
			users: this.app_state.global.users,
			viewType: "code"
		};
	}

	componentDidMount() {
		this.connected = false;

		if (this.socket != null) {
			this.connected = this.socket.connected;

			this.socket.on('receive_view_update', (code_obj) => {
				//if (code_obj.author != _self.state.authorId) {
					let patch = JsDiff.createPatch(null, this.state.code, code_obj.code, null, null);
					let update_code = JsDiff.applyPatch(this.state.code, patch);
	
					this.setState({
						code: update_code
					});
					
					store.dispatch({
						type: "UPDATE_CODE",
						payload: update_code,
						current: code_obj.viewid
					});
				//}
			});
		}		

		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();
			if (this.app_state.global.lastAction == "OPEN_FILE" || this.app_state.global.lastAction == "NEW_FILE") {
				this.getCode();
			}
		});

		this.getCode();
	}

	componentWillUnmount() {
		this.unsubscribe();
	}
	
	componentWillReceiveProps(nextProps) {
		this.p = nextProps;
		this.getCode();
	}

	contextMenu() {
		store.dispatch({
			type: "OPEN_CONTEXT_MENU"
		})
	}

	getCode() {
		let _fileCode = "";
		let _format = "";
		this.app_state = store.getState();

		this.app_state.files.views.map((file,i) => {
			if (this.p.id == file.viewid) {
				_fileCode = file.code;
				_format = file.options.mode;
			}
		});

		if (this.refs.thisView) {
			this.setState({
				authorId: this.app_state.user.instanceId,
				code: _fileCode,
				users: this.app_state.global.users,
				viewType: (_format=="imageview"?_format:"code")
			});
		}
	}

	updateCode(code, change) {
		clearTimeout(this.updateTimer);

		this.setState({code});

		// Throttle update.
		this.updateTimer = setTimeout(() => {

			store.dispatch({
				type: "UPDATE_CODE",
				payload: code,
				current: this.p.id,
			});

			var pos = {
				ch: change.to.ch,
				line: change.to.line
			}

			// Only perform task if connected.
			if (this.connected) {
				var code_obj = {
					code,
					pos,
					viewid: this.p.id,
					author: this.state.authorId,
					timestamp: new Date().getTime()
				}
				this.socket.emit('send_view_update', code_obj);
			}
		}, 250);
	}

	render() {
		var className = "view";
		var viewer = null;
		var style = {}
		
		if (this.app_state.files.multiView) {
			let count = this.app_state.files.actives.length;
			let zIndex = 2;
			let width = (100/count)+'%';

			this.app_state.files.actives.map((viewid,i) => {
				if (viewid == this.p.id) {
					className = "view view--multi-active";
					style = {
						borderTop: "2px solid "+this.app_state.global.config.multiViewColors[i],
						display: "inline-block",
						position: "relative",
						width,
						zIndex
					}
				}
			});
		} else if (this.p.active) {
			className = "view view--active";
		}

		if (this.state.viewType == "imageview") {
			let imgStyle = {
				height: 'auto',
				width: '100%'
			}
			viewer = <img src={this.app_state.global.config.backdoorFullUrl+'/api/file/viewimage/?img='+this.state.code} style={imgStyle}/>
		} else {
			let mode = (this.p.options.mode?this.p.options.mode:"htmlmixed");
			let wrap = (this.p.options.wrap?this.p.options.wrap:this.app_state.global.config.lineWrapping);
			let options = {
				lineNumbers: true,
				lineWrapping: wrap,
				mode,
				extraKeys: {
					'Ctrl-Space': 'autocomplete',
				},
				tabSize: this.app_state.global.config.tabSize,
				theme: this.app_state.global.config.defaultTheme
			};
			viewer = <CodeMirror value={this.state.code} onChange={(editor, metadata, value) => {
				this.updateCode(value, metadata);
			}} onCursor={(editor, position) => {
				// something here.
			}} options={options} />;
		}

		return (
			<ErrorBoundary>
				<div ref="thisView" data-id={this.p.id} className={className} style={style} onContextMenu={() => this.contextMenu()}>
					{viewer}
				</div>
			</ErrorBoundary>
		)
	}
}

export default File;