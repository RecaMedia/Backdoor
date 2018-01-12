/*
@category   WebApplicationKit
@package    Web Application Starter Kit
@author     Shannon Reca
@copyright  2017 Shannon Reca
@since      04/18/17
*/

import {applyMiddleware, createStore} from 'redux';
import {syncHistoryWithStore} from 'react-router-redux';
import {browserHistory} from 'react-router';
import {createLogger} from 'redux-logger';
import asyncDispatch from './util/asyncDispatch';

import defaultState from './util/defaultState';
import reducers from './util/reducers';

const logger = createLogger({
  level: 'log'
});

const middleware = applyMiddleware(asyncDispatch, logger);

const store = createStore(reducers, defaultState, middleware);

export const history = syncHistoryWithStore(browserHistory, store);

export default store;