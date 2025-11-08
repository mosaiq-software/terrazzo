import { RestMethods, RestRequestBody, RestRequestMethod, RestRequestParams, RestResponse, RestRoutes } from '@mosaiq/terrazzo-common/apiTypes';

export const getApiUrl = () => {
    const apiUrl = process.env.API_URL;

    if (!apiUrl) {
        throw new Error('Missing required environment variables for API URL');
    }

    return apiUrl;
};

export async function callTrzApi<T extends RestRoutes>(endpoint: T, params: RestRequestParams[T], body: RestRequestBody[T]): Promise<RestResponse<T>> {
    try {
        const epString = replaceParams(endpoint, params);
        const method = RestRequestMethod[endpoint];
        const noBody = method === RestMethods.GET || method === RestMethods.DELETE;
        const fetchResponse: Response = await fetch(`${getApiUrl()}${epString}`, {
            method,
            body: noBody ? undefined : JSON.stringify(body ?? {}),
            headers: noBody
                ? {}
                : {
                      'Content-Type': 'application/json',
                  },
        });
        if (!fetchResponse) {
            console.error(`Error calling ${endpoint} with method ${method}`);
            throw new Error(`Error calling ${endpoint} with method ${method}`);
        }
        if (!fetchResponse.ok) {
            throw new Error('Server responded ' + fetchResponse.status);
        }
        const textRes: string = await fetchResponse.text();
        let response: RestResponse<T> = '';
        try {
            response = JSON.parse(textRes);
        } catch (error: any) {
            response = textRes;
        }
        return response;
    } catch (error) {
        console.error(`Error calling ${endpoint} with`, error);
        throw error;
    }
}

export const replaceParams = (ep: string, params: { [key: string]: string }): string => {
    let updated = ep;
    for (const p in params) {
        updated = updated.replace(':' + p, params[p]);
    }
    return updated;
};
