import axios from 'axios';
import {removeSpecialChars} from '../utils/utils';

export const getGoogleLocation = async (googleAPI, address1, address2 = '', postalCode = '') => {
    const addressString = `${address1}${address1 && address2 && ','}${address2}${(address1 || address2) && postalCode && ','}${postalCode}`;
    const escapeAddressStr = removeSpecialChars(addressString);
    const resp = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${escapeAddressStr}&key=${googleAPI}`).catch(err => console.log('getGoogleLocation Error>>>>>>>>>>', err));
    // console.log('resp>>>>>>>>>>>>>', resp)
    if (resp && resp.status) {
        if (resp.data.status === 'OK') {
            return resp.data.results[0].geometry.location;
        } else {
            console.log('getGoogleLocation Error>>>>>>>>>>', resp);
            return {msg: 'Location not found'};
        }
    } else {
        console.log('getGoogleLocation Error>>>>>>>>>>', resp);
        return {msg: 'Connection error'};
    }
};
