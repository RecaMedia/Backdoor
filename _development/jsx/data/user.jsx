import Cookies from 'js-cookie';

var user = Cookies.get('bduserdata');
var d = new Date();

if (user != undefined) {
	user = JSON.parse(user);
	user = Object.assign({}, user, {
		instanceId: d.getTime()
	});
} else {
	user = {
		instanceId: d.getTime(),
		fname: "",
		lname: "",
		admin: "",
		email: ""
	};
}

export default user;