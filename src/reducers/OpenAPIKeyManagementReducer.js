import {LIST_API_KEY_MANAGEMENT_SUCCESS} from '../constants';

const initialState = {
    APIKeyStore: [],
};

export default function (state = initialState, action) {
    switch (action.type) {
        case LIST_API_KEY_MANAGEMENT_SUCCESS:
            return {
                ...state,
                APIKeyStore: action.payload
            };

        default:
            return state;
    }
}
