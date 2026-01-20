export enum Environments {
    Development = 'development',
    Production = 'production',
}
export const getEnv = () => {
    const env = process.env.TRZ_ENV;
    if (!env) {
        throw new Error('TRZ_ENV is not defined in environment variables');
    }
    return env;
};

export const isDev = () => {
    return getEnv() === Environments.Development;
};

export const isProd = () => {
    return getEnv() === Environments.Production;
};

export const getApiUrl = () => {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
        throw new Error('API_URL is not defined in environment variables');
    }
    return apiUrl;
};
