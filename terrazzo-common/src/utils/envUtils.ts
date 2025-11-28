export const isProduction = (): boolean => {
    return process.env.PRODUCTION === 'true';
};

export const isDev = (): boolean => {
    return !isProduction();
};
