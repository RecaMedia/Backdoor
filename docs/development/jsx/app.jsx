/*
@category   WebApplicationKit
@package    Web Application Starter Kit
@author     Shannon Reca
@copyright  2017 Shannon Reca
@since      04/18/17
*/

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {Provider} from 'react-redux';
import store, {history} from './store';

import App from './util/connectDispatch';

import Home from './templates/home';
import About from './templates/about';
import Support from './templates/support';

const Routing = (
	<Provider store={store}>
		<Router history={history}>
			<Route path="/Backdoor/" component={App}>
				<IndexRoute component={Home}></IndexRoute>
				<Route path="/about" component={About}></Route>
				<Route path="/support" component={Support}></Route>
			</Route>
		</Router>
	</Provider>
)

// Renders
ReactDOM.render(Routing, document.getElementById("App"));