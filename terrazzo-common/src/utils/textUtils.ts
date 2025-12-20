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

export const breakNames = (name: string) => {
    if (!name.trim()) {
        return { firstName: '', lastName: '' };
    }
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    return { firstName, lastName };
};
