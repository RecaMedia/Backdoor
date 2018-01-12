import {combineReducers} from 'redux';

import global from '../reducers/global';
import user from '../reducers/user';
import files from '../reducers/file';
import ext from '../reducers/ext';

const reducers = combineReducers({
	files,
	global,
	user,
	ext
});

export default reducers;