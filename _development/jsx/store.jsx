import {applyMiddleware, createStore} from 'redux';
import asyncDispatch from './util/asyncDispatch';
// import crossReducer from './util/crossReducer';
// import {createLogger} from 'redux-logger';

import defaultState from './util/defaultState';
import reducers from './util/reducers';

// const logger = createLogger({
//   level: 'log'
// });
// const middleware = applyMiddleware(asyncDispatch , logger);

const middleware = applyMiddleware(asyncDispatch);

const store = createStore(reducers, defaultState, middleware);

export default store;