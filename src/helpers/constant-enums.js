const USER_ROLE = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    USER: 'USER',
    ADMIN: 'ADMIN',
    COACH: 'COACH',
    STUDENT: 'STUDENT'
};

const PLATFORMS = {
    FACEBOOK: 'FACEBOOK',
    GMAIL: 'GMAIL',
    APPLE: 'APPLE',
    EMAIL: 'EMAIL',
    PHONE: 'PHONE'
};

const GENDER = {
    MALE: 'MALE',
    FEMALE: 'FEMALE'
};

const COACH = {
    COACH_TYPE: {
        HIGH_TICKET: 'HIGH_TICKET',
        LOW_TICKET: 'LOW_TICKET'
    }
};
const EVENT = {
    EVENT_TYPE: {
        ONLINE: 'ONLINE',
        ONSITE: 'ONSITE',
        ONE_ON_ONE: 'ONE_ON_ONE'
    }
};
const PRODUCT_STATUS = {
    RUNNING: 'Running',
    READY: 'Ready',
    TO_DO: 'To Do'
};
const COURSE_STATUS = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived'
};

const DATE_FILTERS = {
    PAST: 'Past Events',
    PRESENT: 'All Events',
    FUTURE: 'Upcoming Events'
};

const PRODUCT_FIELDS = ['productName', 'runDate', 'ber', 'status', 'researchMethod', 'category', 'verkoopPrijs', 'link', 'prijs', 'land', 'video1', 'btw', 'mergeExBtw', 'mergeInBtw', 'avatarUrl'];

const DAILY_FINANCES_FIELDS = ['date', 'revenue', 'orders', 'adSpend', 'roas', 'refunds', 'cog', 'profitLoss', 'margin'];

const INVOICES_FIELDS = ['date', 'amount', 'category', 'business', 'facture', 'notes'];

const DATA_FORMAT = {
    PRODUCTS: 'products',
    DAILY_FINANCES: 'dailyFinances',
    INVOICES: 'invoices'
};

const FILE_TYPES = ['pdf', 'docx'];

Object.freeze(USER_ROLE);
Object.freeze(PLATFORMS);
Object.freeze(GENDER);
Object.freeze(COACH);
Object.freeze(EVENT);
Object.freeze(PRODUCT_STATUS);
Object.freeze(COURSE_STATUS);
Object.freeze(DATE_FILTERS);

const CONSTANT_ENUM = {
    USER_ROLE,
    PLATFORMS,
    GENDER,
    COACH,
    EVENT,
    PRODUCT_STATUS,
    COURSE_STATUS,
    FILE_TYPES,
    DATE_FILTERS,
    PRODUCT_FIELDS,
    DAILY_FINANCES_FIELDS,
    INVOICES_FIELDS,
    DATA_FORMAT
};

module.exports = CONSTANT_ENUM;
