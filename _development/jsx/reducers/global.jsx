// import $ from 'jquery';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import mixin from '../mixins/global';

const global = function(state = {}, action) {

	state = Object.assign({}, state, {
		lastAction: action.type
	})

	switch (action.type) {
		case "ALERT" : {

			var alert_box = $('#AlertBox');
			var body = $('body');
			alert_box.html(action.message);
			body.addClass('show-alert');
			setTimeout(function(){
				body.removeClass('show-alert');
			}, 3000);

			break;
		}

		case "GET_CONFIG" : {

			fetch('api/config/', {
				method: 'POST'
			}).then((response) => {
				return response.json();
			}).then(function(data) {
				// https://stackoverflow.com/questions/24337317/encrypt-with-php-decrypt-with-javascript-cryptojs
				// let key = CryptoJS.enc.Utf8.parse('Kx#MX!83@1zQ2oC4');
				// let iv = CryptoJS.enc.Base64.parse(data.part1);
				// let ciphertext = data.part2;
				// let plaintext = CryptoJS.AES.decrypt(ciphertext, key, {
				// 	iv: iv,
				// 	padding: CryptoJS.pad.NoPadding
				// });
				// let preconfig = CryptoJS.enc.Utf8.stringify(plaintext);
				// let preconfig_clean = preconfig.substring(0, preconfig.lastIndexOf('}') + 1);
				// let config = JSON.parse(preconfig_clean);

				/* SIMPLIFIED ENCRYPTION FOR NOW */
				let config = JSON.parse(atob(data.config));

				// // Set full URL path to access web app.
				// // if (config.domainIsBackdoorApp) {
				 	config.backdoorFullUrl = config.backdoorDomain;
				// // } else {
				// // 	config.backdoorFullUrl = config.backdoorDomain + '/' + config.backdoorDir;
				// // }

				action.asyncDispatch({
					type: "UPDATE_GLOBAL",
					global: {
						config
					}
				});
			}).catch((error) => {
				mixin.processErrors(error);
			});

			break;
		}

		case "UPDATE_GLOBAL" : {

			state = Object.assign({}, state, action.global);

			break;
		}

		case "UPDATE_USERS" : {

			state = Object.assign({}, state, {
				socket: state.socket,
				users: action.payload
			});

			break;
		}

		case "UPDATE_SESSION" : {

			Cookies.set('bdsession', action.session, {
				expires: 1,
				path: '/'
			});

			state = Object.assign({}, state, {
				session: action.session
			});

			break;
		}

		case "SET_HEADER" : {

			let api_headers = new Headers();
			api_headers.append("session", state.session);
			api_headers.append("bd2-api-key", state.config.apiKey);
			api_headers.append("member-api-key", action.key);
			
			state = Object.assign({}, state, {
				headers: api_headers
			});

			// Check for another dispatch.
			if (action.nextType != false) {
				// Dispatch call.
				action.asyncDispatch({
					type: action.nextType
				});
			}

			break;
		}

		case "SET_SETTINGS" : {
			
			state = Object.assign({}, state, {
				settings: action.settings
			});

			break;
		}

		case "SET_SIGNIN" : {
			
			state = Object.assign({}, state, {
				key: action.key
			});

			action.asyncDispatch({
				type: "CHECK_SIGNIN"
			});

			break;
		}

		case "SET_SIGNOUT" : {

			state = Object.assign({}, state, {
				key: null
			});

			action.asyncDispatch({
				type: "CHECK_SIGNOUT"
			});

			break;
		}

		case "DISCONNECT_SOCKET" : {

			state.socket.close();
			console.error("Connection has now closed.")

			state = Object.assign({}, state, {
				socket: null
			});

			break;
		}
	}
	return state;
}

export default global;