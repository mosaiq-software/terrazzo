import { UserHeader } from '../types/userTypes';

export const fullName = (user: UserHeader | undefined | null) => {
    if (!user) {
        return 'Anonymous';
    }
    if (!user.firstName && !user.lastName) {
        return user.username;
    }
    return `${user.firstName} ${user.lastName}`;
};
