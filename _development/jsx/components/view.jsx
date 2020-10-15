import React from 'react';
import _ from 'lodash';
// import $ from 'jquery';
// import 'jquery-ui';
import store from '../store';

import FileTab from './fileTab';
import File from './file';

class View extends React.Component {

	constructor(props) {
		super(props);

		this.contextMenu = this.contextMenu.bind(this);
		this.sortedItems = this.sortedItems.bind(this);
		this.handleSortableUpdate = this.handleSortableUpdate.bind(this);
		this.getOrder = this.getOrder.bind(this);
		this.updateFiles = this.updateFiles.bind(this);

		this.state = {
			files: []
		};
	}

	componentDidMount() {
		this.unsubscribe = store.subscribe(() => {
			this.app_state = store.getState();

			if (
				this.app_state.global.lastAction == "OPEN_FILE" || 
				this.app_state.global.lastAction == "NEW_FILE" || 
				this.app_state.global.lastAction == "REMOVE_FILE") {
					
				// If connected, loop through to opened files.
				if (this.app_state.global.socket != null) {
					if (this.app_state.global.socket.connected) {
						// Loop through files.
						this.app_state.files.views.map((file,i) => {
							// Pass file object to server.
							this.app_state.global.socket.emit('opened_view', {
								code: file.code,
								pos: null,
								viewid: file.viewid,
								author: this.app_state.user.instanceId
							});
						});
					}
				}
				
				// Update views.
				this.updateFiles(this.app_state.files.views);
			}
		});
	}

	componentDidUpdate() {
		// http://www.sawyerh.com/writing/using-jquery-ui-sortable-with-react/
		$('.view-tabs ul').sortable({
			axis: 'x',
			cancel: '',
			containment: 'parent',
			cursor: 'move',
			handle: '.draggable',
			update : this.handleSortableUpdate
		});
	}

	componentWillUnmount() {
		$('.view-tabs ul').sortable('destroy'); 
		this.unsubscribe();
	}

	contextMenu() {
		store.dispatch({
			type: "OPEN_CONTEXT_MENU"
		})
	}

	sortedItems() {
		// sortBy provided by https://lodash.com
		var items = _.sortBy(this.state.files, 'position');

		return items.map((item, i) => {
			return <FileTab key={item.viewid} i={i} id={item.viewid} filename={item.filename} active={item.active}/>
		})
	}

	handleSortableUpdate(e, ui) {
		var viewid = ui.item.data('id');
		var $node = $('.view-tabs ul');
		var ids = $node.sortable('toArray', {attribute: 'data-id'});

		$node.sortable('cancel');
		this.getOrder(viewid,ids);
	}

	getOrder(viewid, order) {
		store.dispatch({
			type: "REORDER",
			order,
			viewid
		});
	}

	updateFiles(files) {
		if (this.refs.mainViews) {
			this.setState({
				files
			});
		}
	}

	render() {
		return (
			<div ref="mainViews" className="main-container__views">
				<div className="view-tabs">
					<ul>
						{this.sortedItems()}
					</ul>
				</div> 
				<div className="view-content" onContextMenu={() => this.contextMenu()}>
					{this.state.files.map((file, i) => <File key={i} i={i} id={file.viewid} code={file.code} options={file.options} active={file.active}/>)}
				</div>
			</div>
		)
	}
}

export default View;