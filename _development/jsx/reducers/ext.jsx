const ext = function(state = {}, action) {

	switch (action.type) {

		case "UPDATE_EXTENSIONS" : {

			let tmp = state;

			if (action.extlist.length) {
				action.extlist.map((ext,i) => {
					if (tmp[ext.namespace] != undefined) {
						tmp[ext.namespace] = Object.assign({}, tmp[ext.namespace], {
							data: ext
						});
					} else {
						tmp[ext.namespace] = {
							data: ext
						}
					}
				});
				state = Object.assign({}, state, tmp);
			} else {
				state = {};
			}

			break;
		}
		
		case "INSERT_CLASS" : {

			state[action.namespace] = Object.assign({}, state[action.namespace], {
				ext: action.ext
			});

			break;
		}

	}
	return state;
}

export default ext;