export const normalizePort = (val: number | string): number | string | boolean => {
    let port: number = (typeof val === 'string') ? parseInt(val) : val;
    if (isNaN(port)) return val;
    else if (port >= 0) return port;
    else return false;
};

export const onError = (port: any) => {
    return (error: NodeJS.ErrnoException): void => {
        switch(error.code) {
            case 'EACCES':
                console.error(`Requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`Port ${port} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
};

export const onListening = (port: any) => {
    return (): void => {
        console.log(`Listening at ${port}...`);
    }
};

export const handleError = (error: Error) => {
    let errorMessage: string = `${error.name}: ${error.message}`;
    console.log(errorMessage);
    return Promise.reject(new Error(errorMessage));
};

export const throwError = (condition: boolean, message: string): void => {
    if (condition) throw new Error(message);
};

export const JWT_SECRET: string = process.env.JWT_SECRET;