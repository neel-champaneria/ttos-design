import APIResource from './APIResource';
import {ROLE_SA} from '../constants';

export const fetchMenuForItemSettingService = async (user) => {
    return await APIResource.get(
        'api/slave/restaurant/fetchMenu',
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const saveResProfileService = async (data, user) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.post(
        'api/slave/restaurant/save',
        data,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const saveProviderService = async (data, user) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.post(
        'api/slave/restaurant/saveSA',
        data,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const unlockAPIService = async (user) => {
    return await APIResource.post('api/slave/restaurant/unlock',
        {},
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const resetResDataService = async (user) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.get(
        'api/slave/restaurant/cleanToNewSite',
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const loadResProfileService = async (user) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);
    let url = 'api/slave/restaurant/load';
    if (user?.token_decode?.authorities?.includes(ROLE_SA)) {
        url = 'api/slave/restaurant/loadSA';
    }

    return await APIResource.get(
        url,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const listDeliveryZoneService = async (user) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.get(
        'api/slave/restaurant/listDeliveryZone',
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const saveDeliveryZoneService = async (data, user) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.post(
        'api/slave/restaurant/saveDeliveryZone',
        data,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const deleteDeliveryZoneService = async (data, user) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.post(
        'api/slave/restaurant/deleteDeliveryZone',
        data,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const listResCustomersService = async (user, filter, page, pageSize) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.get(
        `api/slave/restaurant/listCustomers?sortField=${filter.sortField}&sortDir=${filter.sortDir}&nameSearch=${filter.nameSearch}&emailSearch=${encodeURIComponent(filter.emailSearch)}&phoneSearch=${filter.phoneSearch}&page=${page}&pageSize=${pageSize}`,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const listResOrdersWithStatusService = async (user, filter, customerEmail, page, pageSize) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);
    // console.log('listResOrdersWithStatusService filter Obj ===>', filter, `customerEmail ===> ${customerEmail}`, `page ===> ${page}`, `, pageSize ===> ${pageSize}`);
    const minimumPrepareTime = filter?.minimumPrepareTime || 30;

    return await APIResource.get(
        `api/slave/restaurant/listOrders?orderNumSearch=${filter.orderNumSearch}&cusNameSearch=${filter.cusNameSearch}&cusEmailSearch=${encodeURIComponent(filter.cusEmailSearch)}&cusPhoneSearch=${filter.cusPhoneSearch}&type=${filter.type}&minimumPrepareTime=${minimumPrepareTime}&status=${filter.status}&orderingMethod=${filter.orderingMethod}&range=${filter.range}&sortField=${filter.sortField}&sortDir=${filter.sortDir}&customerEmail=${encodeURIComponent(customerEmail)}&page=${page}&pageSize=${pageSize}`,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const listWaitingOrderService = async (user, filter, customerEmail, page, pageSize) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);
    // console.log('listResOrdersWithStatusService filter Obj ===>', filter, `customerEmail ===> ${customerEmail}`, `page ===> ${page}`, `, pageSize ===> ${pageSize}`);

    return await APIResource.get(
        `api/slave/restaurant/listWaitingOrders?orderNumSearch=${filter.orderNumSearch}&cusNameSearch=${filter.cusNameSearch}&cusEmailSearch=${encodeURIComponent(filter.cusEmailSearch)}&cusPhoneSearch=${filter.cusPhoneSearch}&orderingMethod=${filter.orderingMethod}&sortField=${filter.sortField}&sortDir=${filter.sortDir}&customerEmail=${encodeURIComponent(customerEmail)}&page=${page}&pageSize=${pageSize}`,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const listWaitingDeliveryOrderService = async (user, customerEmail, page, pageSize) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.get(
        `api/slave/restaurant/listWaitingDeliveryOrder?&customerEmail=${encodeURIComponent(customerEmail)}&page=${page}&pageSize=${pageSize}`,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};


export const listRegularUserWithStatusOrdersService = async (user, filter, page, pageSize) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.get(
        `api/slave/user/listOrders?status=${filter}&page=${page}&pageSize=${pageSize}`,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const loadReportService = async (filter, user) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.post(
        'api/slave/restaurant/overviewReport',
        filter,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const loadCustomerInsightService = async (email, dateFrom, dateTo, user) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.get(
        `api/slave/restaurant/customerInsight?&customerEmail=${encodeURIComponent(email)}&from=${dateFrom}&to=${dateTo}`,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const getLalamoveQuotationService = async (orders, type, user, deliveryRemark, scheduleAt) => {
    //console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', data);

    return await APIResource.post(
        `api/slave/delivery/lalamove/quotation`,
        {
            orders: orders,
            serviceType: type,
            deliveryRemark: deliveryRemark,
            scheduleAt: scheduleAt
        },
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const createLalamoveOrderService = async (orders, type, user, deliveryRemark, scheduleAt) => {
    //console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', data);

    return await APIResource.post(
        `api/slave/delivery/lalamove/create`,
        {
            orders: orders,
            serviceType: type,
            deliveryRemark: deliveryRemark,
            scheduleAt: scheduleAt
        },
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const cancelLalamoveService = async (order, user) => {
    //console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', data);

    return await APIResource.post(
        `api/slave/delivery/lalamove/cancel/${order.id}`,
        {},
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const changeOrderStatusToDeliveringService = async (orders, type, user) => {
    // console.log('changeOrderStatusToDeliveringService>>>>>>>>>>>>>>>>>>>>>>>>>>', orders);
    return await APIResource.post(
        `api/slave/restaurant/changeOrderStatusToDelivering`,
        {
            orders: orders,
            serviceType: type.toUpperCase()
        },
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const exportDataService = async (data, user) => {
    // console.log('exportDataService sent data>>>>>>>>>>>>>>>>>>>>>>>>>>', data);
    return await APIResource.downloadPost(
        `api/slave/restaurant/exportAllOrders`,
        data,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
            'responseType': 'blob', // Important
        }
    );
};

export const exportClientService = async (user) => {
    return await APIResource.downloadPost(
        `api/slave/restaurant/exportAllClients`,
        {},
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
            'responseType': 'blob', // Important
        }
    );
};

export const listOpenAPIKeyService = async (user) => {
    return await APIResource.get('api/slave/restaurant/list-apikey',
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const generateOpenAPIKeyService = async (user) => {
    return await APIResource.post('api/slave/restaurant/generate-apikey',
        {},
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const saveOpenAPIKeyService = async (openApiKeyData, user) => {
    return await APIResource.post('api/slave/restaurant/save-apikey',
        openApiKeyData,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const deleteOpenAPIKeyService = async (apiKey, user) => {
    return await APIResource.get(`api/slave/restaurant/delete-apikey?apiKey=${apiKey}`,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const saveSoundService = async (data, user) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.post(
        'api/slave/restaurant/save-sound',
        data,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};