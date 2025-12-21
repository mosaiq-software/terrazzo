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

/**
 * Generates a random 4-digit discriminator string (0000 - 9999)
 */
export const generateUsernameDiscriminator = (): string => {
    const randomNum = Math.floor(Math.random() * 10000);
    return randomNum.toString().padStart(4, '0');
};
