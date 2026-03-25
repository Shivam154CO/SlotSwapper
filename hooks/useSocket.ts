import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const useSocket = (userId: string | null) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!userId) return;

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            upgrade: false
        });

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            newSocket.emit('authenticate', userId);
        });

        newSocket.on('user_status', ({ userId: statusUserId, status }: { userId: string, status: string }) => {
            setOnlineUsers((prev: Set<string>) => {
                const next = new Set(prev);
                if (status === 'online') next.add(statusUserId);
                else next.delete(statusUserId);
                return next;
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    return { socket, onlineUsers };
};
