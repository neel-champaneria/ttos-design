import APIResource from './APIResource';

export const savePromotionService = async (data, user) => {
    return await APIResource.post(
        'api/slave/promotion/savePromotion',
        data,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const deletePromotionService = async (promotionId, user) => {
    return await APIResource.get(
        `api/slave/promotion/deletePromotion?promotionId=${promotionId}`,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const listPromotionService = async (user) => {
    return await APIResource.get(
        'api/slave/promotion/listPromotion',
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const loadPromotionStatService = async (filter, user) => {
    // console.log('user>>>>>>>>>>>>>>>>>>>>>>>>>>', user);

    return await APIResource.post(
        'api/slave/restaurant/promotionStats',
        filter,
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};

export const generateCouponCodeService = async (user) => {
    return await APIResource.get(
        'api/slave/promotion/generateCouponCode',
        {
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
            },
        }
    );
};
