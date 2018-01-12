/*
@category   WebApplicationKit
@package    Web Application Starter Kit
@author     Shannon Reca
@copyright  2017 Shannon Reca
@since      04/18/17
*/

import React from 'react';

import Header from './components/header';

class App extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		return (
			<div>
				<Header title='The Best FREE In Browser Code Editor'/>
				{React.cloneElement(this.props.children, this.props)}
			</div>
		)
	}
}

export default App;