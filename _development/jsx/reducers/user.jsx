import Cookies from 'js-cookie';
import mixin from '../mixins/global';

var app_state = null;


const fileAPICall = function(settings) {
	return fetch(settings.appUrl + settings.url, {
		method: settings.method,
		headers: settings.headers,
		body: settings.data
	}).catch((error) => {
		mixin.processErrors(error);
	});
}

const user = function(state = {}, action) {

	if (typeof action.getState === 'function') {
		app_state = action.getState();
	}

	switch (action.type) {
		case "TEST_FNAME" : {
			state = Object.assign({}, state, {
				fname: action.payload
			})
			break;
		}

		case "TEST_LNAME" : {
			state = Object.assign({}, state, {
				lname: action.payload
			})
			break;
		}

		case "UPDATE_CLIENT_ID" : {
			state = Object.assign({}, state, {
				clientId: action.payload
			})
			break;
		}

		case "SET_SIGNIN" :
		case "UPDATE_SIGNIN" : {

			Cookies.set('bduserdata', JSON.stringify(action.user), {
				expires: 1,
				path: '/'
			});

			state = Object.assign({}, state, action.user);

			break;
		}

		case "SET_SIGNOUT" : {

			var d = new Date();

			state = Object.assign({}, state, {
				instanceId: d.getTime(),
				fname: "",
				lname: "",
				admin: "",
				email: ""
			});

			break;
		}

		case "UPDATE_USER" : {

			let formData = new FormData();
			formData.append('usercode',action.user.code);
			formData.append('email',action.user.email);
			formData.append('fname',action.user.fname);
			formData.append('lname',action.user.lname);
			
			let post = fileAPICall({
				url: '/api/users/update/',
				method: 'POST',
				data: formData,
				headers: action.headers,
				appUrl: action.appUrl
			});

			post.then((response) => {
				return response.json();
			}).then((data) => {
				let asyncCalls = [];
				asyncCalls.push({
					type: "UPDATE_SIGNIN",
					user: data.user
				});
				asyncCalls.push({
					type: "ALERT",
					message: data.statusMessage
				});
				action.asyncDispatch(asyncCalls);
			});

			break;
		}

		case "UPDATE_USER_PASS" : {

			let formData = new FormData();
			formData.append('usercode',action.user.code);
			formData.append('newpass',btoa(action.user.newpass));
			
			let post = fileAPICall({
				url: "/api/users/updatepass/",
				method: 'POST',
				data: formData,
				headers: action.headers,
				appUrl: action.appUrl
			});

			post.then((response) => {
				return response.json();
			}).then((data) => {
				let asyncCalls = [];
				if (data.success) {
					asyncCalls.push({
						type: "PASS_UPDATED"
					});
				}
				asyncCalls.push({
					type: "ALERT",
					message: data.statusMessage
				});
				action.asyncDispatch(asyncCalls);
			});

			break;
		}

		case "CREATE_USER" : {

			let formData = new FormData();
			formData.append('usercode',action.user.code);
			formData.append('email',action.user.email);
			formData.append('fname',action.user.fname);
			formData.append('lname',action.user.lname);
			formData.append('pass',btoa(action.user.pass));
			formData.append('admin',0);
			
			let post = fileAPICall({
				url: "/api/users/add/",
				method: 'POST',
				data: formData,
				headers: action.headers,
				appUrl: action.appUrl
			});

			post.then((response) => {
				return response.json();
			}).then((data) => {
				let asyncCalls = [];
				if (data.success) {
					asyncCalls.push({
						type: "USER_SUCCESSFULLY_CREATED"
					});
				}
				asyncCalls.push({
					type: "ALERT",
					message: data.statusMessage
				});
				action.asyncDispatch(asyncCalls);
			});

			break;
		}
	}
	return state;
}

export default user;