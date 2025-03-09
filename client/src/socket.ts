import io from 'socket.io-client';
import config from './env/config';

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    return io(config.backendEndpoint, options);
};