import * as ActionTypes from '../constants/ActionTypes';

export default function users(state = {}, action) {
	console.log("action");
	console.log(action.update)
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_USERS:
			newState.users = action.update.response.data;
			break;
		default:
	}
	return newState;
}