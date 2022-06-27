import APIResource from '../services/APIResource';

export const registerService = async (data) => {
    return await APIResource.post('open/api/slave/user/register', data);
};

export const loginService = async (data) => {
    const {email, pass} = data;
    const token = process.env.NEXT_PUBLIC_CLIENT_BASIC_AUTH_TOKEN;
    return await APIResource.post(
        `oauth/token?grant_type=password&username=${encodeURIComponent(email)}&password=${encodeURIComponent(pass)}`,
        null,
        {
            headers: {
                'Authorization': `Basic ${token}`,
            },
        }
    );
};

export const oAuthLoginService = async (data) => {
    console.log('login data>>>>>>>>>>>>>>>>>>>>>>>>>>>>', data);
    const {userName, token, type} = data;
    const envToken = process.env.NEXT_PUBLIC_CLIENT_BASIC_AUTH_TOKEN;
    return await APIResource.post(
        `oauth/token?grant_type=social&username=${encodeURIComponent(userName)}&password=${token}&type=${type}`,
        null,
        {
            headers: {
                'Authorization': `Basic ${envToken}`,
            },
        }
    );
};

export const loadProfileService = async (user) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.get(
        'api/slave/user/profile',
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const updateAccountInfoService = async (user, data) => {
    // console.log('data>>>>>>>>>>>>>>>>>>>>>>>>>>', data);

    return await APIResource.post(
        'api/slave/user/saveUserProfile',
        data,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const changeAdminEmailService = async (user, data) => {
    // console.log('data>>>>>>>>>>>>>>>>>>>>>>>>>>', data);

    return await APIResource.post(
        'api/slave/user/changeAdminEmail',
        data,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const saveUserAddressService = async (user, data) => {
    // console.log('data>>>>>>>>>>>>>>>>>>>>>>>>>>', data);

    return await APIResource.post(
        'api/slave/user/saveUserAddress',
        data,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const deleteUserAddressService = async (user, data) => {
    // console.log('data>>>>>>>>>>>>>>>>>>>>>>>>>>', data);

    return await APIResource.post(
        'api/slave/user/deleteUserAddress',
        data,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const forgotPasswordService = async (email) => {
    return await APIResource.get(`open/api/slave/user/forgotPassword?email=${encodeURIComponent(email)}`);
};

export const validateResetKeyService = async (data) => {
    console.log('reset password from service >>>>>>>>>>>>>>>>>>>>>>>>>>>>>', data);
    return await APIResource.get(`open/api/slave/user/validateResetPasswordKey?resetKey=${encodeURIComponent(data)}`);
};

export const setNewPasswordService = async (data) => {
    console.log('reset password from service >>>>>>>>>>>>>>>>>>>>>>>>>>>>>', data);
    return await APIResource.post(`open/api/slave/user/setNewPassword`, data);
};

export const changePasswordService = async (user, data) => {
    return await APIResource.post(
        'api/slave/user/changePassword',
        data,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

/**
 * Because of this server call from server (url need dynamic by tenant client request)
 * so, we need buidl full url to override current base URL(client side)
 */
export const activateUserService = async (key) => {
    return await APIResource.get(`open/api/slave/user/activateAccount?activationKey=${encodeURIComponent(key)}`);
};
