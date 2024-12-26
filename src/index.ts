import 'dotenv/config'
import { initApp } from './app';

const start = async () => {
    const app = await initApp();
    const port = process.env.API_PORT;
    const url = process.env.API_URL;
    if (!port || !url) {
        throw new Error('API_PORT and API_URL must be provided');
    }

    app.listen(port, () => {
        console.log(`Server started at ${url}:${port}`);
    });
}

start();