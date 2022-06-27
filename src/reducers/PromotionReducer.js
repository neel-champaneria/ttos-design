import {LIST_PROMOTION_SUCCESS} from '../constants';

const initialState = {
    promotions: [],
};

export default function (state = initialState, action) {
    switch (action.type) {
        case LIST_PROMOTION_SUCCESS:
            return {
                ...state,
                promotions: action.payload
            };

        default:
            return state;
    }
}
