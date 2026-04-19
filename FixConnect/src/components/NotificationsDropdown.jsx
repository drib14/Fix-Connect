import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

export function NotificationsDropdown() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const socket = useSocket();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setNotifications(res.data.data);
                    setUnreadCount(res.data.data.filter(n => !n.isRead).length);
                }
            } catch (err) {
                console.error("Failed to fetch notifications");
            }
        };

        fetchNotifications();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification) => {
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
        };

        socket.on('newNotification', handleNewNotification);

        return () => {
            socket.off('newNotification', handleNewNotification);
        };
    }, [socket]);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((prev) =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark as read");
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative bg-background border-border/50">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive flex items-center justify-center text-[10px] font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-card/95 backdrop-blur-md border-border/50 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No notifications yet.</p>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    className={`p-3 rounded-lg text-sm transition-colors cursor-pointer ${notif.isRead ? 'bg-transparent hover:bg-muted/50' : 'bg-primary/10 hover:bg-primary/20'}`}
                                    onClick={() => !notif.isRead && markAsRead(notif._id)}
                                >
                                    <p className={`${notif.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">
                                        {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
