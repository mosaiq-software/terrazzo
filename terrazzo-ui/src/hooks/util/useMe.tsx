import { useUserContext } from '@trz/contexts/user-context';
import { useUser } from '../data/useUser';

export const useMe = () => {
    const userCtx = useUserContext();
    const user = useUser(userCtx.userId);
    return user;
};
