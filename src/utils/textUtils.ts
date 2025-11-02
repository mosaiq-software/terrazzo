import { UserHeader} from '../types';

export const fullName = (user: UserHeader | undefined | null) => {
    if(!user){
        return 'User';
    }
    if(!user.firstName && !user.lastName){
        return user.username;
    }
    return `${user.firstName} ${user.lastName}`;
}