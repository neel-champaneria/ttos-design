import {removeSpecialChars} from '../utils/utils';

export const getLeafletLocation = async (address1, address2 = '', postalCode = '') => {
    const OpenStreetMapProvider = require('leaflet-geosearch').OpenStreetMapProvider;
    const provider = new OpenStreetMapProvider();
    const addressString = `${address1}${address1 && address2 && ','}${address2}${(address1 || address2) && postalCode && ','}${postalCode}`;
    const escapeAddressStr = removeSpecialChars(addressString);
    const resp = await provider.search({query: escapeAddressStr}).catch(err => console.log('getGoogleLocation Error>>>>>>>>>>', err));
    console.log('resp>>>>>>>>>>>>>', resp)
    if (resp && resp.length >= 1) {
        const location = {};
        location.lng = resp[0].x;
        location.lat = resp[0].y;
        return location;
    } else {
        if (resp && resp.length == 0) {
            return {msg: 'No location found'};
        } else {
            console.log('getLeafletLocation Error>>>>>>>>>>', resp);
            return {msg: 'Connection error'};
        }
    }
};
