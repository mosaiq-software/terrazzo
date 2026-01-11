export const UID0 = '00000000-0000-0000-0000-000000000000';
export const UID1 = '11111111-1111-1111-1111-111111111111';
export const UID2 = '22222222-2222-2222-2222-222222222222';
export const UID3 = '33333333-3333-3333-3333-333333333333';
export const UID4 = '44444444-4444-4444-4444-444444444444';
export const UID5 = '55555555-5555-5555-5555-555555555555';
export const UID6 = '66666666-6666-6666-6666-666666666666';
export const UID7 = '77777777-7777-7777-7777-777777777777';
export const UID8 = '88888888-8888-8888-8888-888888888888';
export const UID9 = '99999999-9999-9999-9999-999999999999';
export const UIDA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
export const UIDB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
export const UIDC = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
export const UIDD = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
export const UIDE = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
export const UIDF = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

export const now = () => {
    return 1000000000000;
};

export const secondsMs = (seconds: number) => {
    return seconds * 1000;
};

export const minutesMs = (minutes: number) => {
    return secondsMs(minutes * 60);
};

export const hoursMs = (hours: number) => {
    return minutesMs(hours * 60);
};

export const daysMs = (days: number) => {
    return hoursMs(days * 24);
};

export const weeksMs = (weeks: number) => {
    return daysMs(weeks * 7);
};
