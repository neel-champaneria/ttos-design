import {
    LOAD_RES_PROFILE_SUCCESS,
    LOAD_RES_PROFILE_FAIL,
    ADD_DELIVERY_ZONE,
    LIST_DELIVERY_ZONE_SUCCESS,
    DELETE_ZONE,
    CLEAN_CURRENT_DELIVERY_ZONE,
    CURRENT_DELIVERY_ZONE,
    UPDATE_CURRENT_DELIVERY_ZONE,
    LIST_DELIVERY_ZONE_SUCCESS_FOR_OPEN_USER,
    FETCH_MENU_FOR_ITEM_SETTING_SUCCESS,
    LIST_ORDER_AHEAD_DAYS_SUCCESS,
} from '../constants';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const initialState = {
    zones: [],
    menu: [],
    orderAheadDays: [],
};

export default function (state = initialState, action) {
    let tempZones = [];
    let newZone;

    switch (action.type) {
        case LOAD_RES_PROFILE_SUCCESS:
            return {
                ...state,
                ...action.payload
            };

        case LOAD_RES_PROFILE_FAIL:
            return state;

        case ADD_DELIVERY_ZONE:
            if (state.tenantDeliveryZoneList) {
                tempZones = [...state.tenantDeliveryZoneList];
            }
            newZone = action.payload;
            tempZones.push(newZone);

            return {
                ...state,
                tenantDeliveryZoneList: tempZones
            };

        case LIST_DELIVERY_ZONE_SUCCESS:
            // console.log('tenantDeliveryZoneList>>>>>>>>>>>>>>>>>>', action.payload);
            action.payload.tenantDeliveryZoneList.map((zone) => {
                zone.geoJson = JSON.parse(zone.geoJson);
            })
            return {
                ...state,
                nextSeq: action.payload.nextSeq,
                tenantDeliveryZoneList: action.payload.tenantDeliveryZoneList
            };

        case LIST_DELIVERY_ZONE_SUCCESS_FOR_OPEN_USER:
            // console.log('tenantDeliveryZoneList>>>>>>>>>>>>>>>>>>', action.payload);
            action.payload?.map((zone) => {
                zone.geoJson = JSON.parse(zone.geoJson);
            })
            return {
                ...state,
                nextSeq: action.payload?.nextSeq,
                tenantDeliveryZoneList: action.payload
            };

        case CURRENT_DELIVERY_ZONE:
            let newTenantDeliveryZoneList = [...state.tenantDeliveryZoneList];
            if (parseInt(action.payload.id || 0) === 0) {
                newTenantDeliveryZoneList.push(action.payload);
            }
            return {
                ...state,
                currentZone: action.payload,
                tenantDeliveryZoneList: newTenantDeliveryZoneList
            };

        case UPDATE_CURRENT_DELIVERY_ZONE:
            let currentTenantDeliveryZoneList = [...state.tenantDeliveryZoneList];
            currentTenantDeliveryZoneList.map((zone) => {
                if (zone.seq == action.payload.seq) {
                    //change type
                    zone.type = action.payload.type;
                }
            });
            return {
                ...state,
                currentZone: action.payload,
                tenantDeliveryZoneList: currentTenantDeliveryZoneList
            };

        case FETCH_MENU_FOR_ITEM_SETTING_SUCCESS:
            return {
                ...state,
                menu: action.payload
            };

        case CLEAN_CURRENT_DELIVERY_ZONE:
            return {
                ...state,
                currentZone: {
                    seq: -1
                }
            };

        case LIST_ORDER_AHEAD_DAYS_SUCCESS:
            return {
                ...state,
                orderAheadDays: action.payload
            };

        case DELETE_ZONE:
            return {
                ...state,
                tenantDeliveryZoneList: state.tenantDeliveryZoneList.filter(zone => zone.seq !== action.payload.seq)
            };

        default:
            return state;
    }
}
