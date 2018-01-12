import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import store from './store';

import App from './util/connectDispatch';

ReactDOM.render(
	<Provider store={store}>
		<App/>
	</Provider>, document.querySelector("#Backdoor")
);

/* 
https://answers.microsoft.com/en-us/protect/forum/protect_defender-protect_scanning-windows_10/windows-defender-bug-detects-javascript-files-as/c8a2c595-6a54-4b2e-a0b5-6aa0f8f536a3?auth=1
*/