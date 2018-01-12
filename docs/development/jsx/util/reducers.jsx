/*
@category   WebApplicationKit
@package    Web Application Starter Kit
@author     Shannon Reca
@copyright  2017 Shannon Reca
@since      04/18/17
*/

import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';

import global from '../reducers/global';

const reducers = combineReducers({
	global,
  routing: routerReducer
});

export default reducers;