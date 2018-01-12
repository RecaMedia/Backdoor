import Cookies from 'js-cookie';
import io from 'socket.io-client';

const socket = io("http://localhost:3001/test");

// Process cookies.
var key = Cookies.get('bdmemberkey');
var session = Cookies.get('bdsession');

// Set null if undefined.
if (key == undefined) {
	key = null;
}
if (session == undefined) {
	session = null;
}

const global = {
	key,
	session,
	settings: null,
	socket,
	users: []
};

export default global;