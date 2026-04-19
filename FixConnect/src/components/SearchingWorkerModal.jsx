import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';
import { ResponsiveModal } from './ResponsiveModal';
import { Button } from './ui/button';

export function SearchingWorkerModal({ isOpen, setIsOpen, bookingId }) {
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
    const socket = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen || !bookingId) return;

        setTimeLeft(180);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoCancel();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, bookingId]);

    useEffect(() => {
        if (!socket || !isOpen || !bookingId) return;

        const handleJobAccepted = (booking) => {
            if (booking._id === bookingId) {
                setIsOpen(false);
                navigate(`/booking/${bookingId}`);
            }
        };

        socket.on('jobAccepted', handleJobAccepted);
        socket.on('bookingStatusUpdated', handleJobAccepted);

        return () => {
            socket.off('jobAccepted', handleJobAccepted);
            socket.off('bookingStatusUpdated', handleJobAccepted);
        };
    }, [socket, isOpen, bookingId, navigate]);

    const handleAutoCancel = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/bookings/${bookingId}/cancel`, {
                reason: 'No worker found within 3 minutes timeout'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('No workers accepted your job within the time limit. The booking has been cancelled.');
            setIsOpen(false);
            window.location.reload(); // Refresh to reset state
        } catch (err) {
            console.error("Failed to auto cancel", err);
            setIsOpen(false);
        }
    };

    const handleManualCancel = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/bookings/${bookingId}/cancel`, {
                reason: 'User cancelled during search'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsOpen(false);
            window.location.reload();
        } catch (err) {
            console.error("Failed to cancel booking manually", err);
        }
    };

    const searchingTexts = [
        "Finding nearby workers...",
        "Broadcasting your request...",
        "Matching your service...",
        "Just a moment more...",
        "Contacting top professionals..."
    ];

    const [textIndex, setTextIndex] = useState(0);

    useEffect(() => {
        if (!isOpen) return;
        const textTimer = setInterval(() => {
            setTextIndex(prev => (prev + 1) % searchingTexts.length);
        }, 3000);
        return () => clearInterval(textTimer);
    }, [isOpen]);

    return (
        <ResponsiveModal
            title="Requesting..."
            description="Please don't close this window."
            open={isOpen}
            onOpenChange={() => {}} // prevent manual close
        >
            <div className="flex flex-col items-center py-8">
                {/* Custom Pin Radar Animation */}
                <div className="relative flex justify-center items-center w-32 h-32 mb-8">
                    <div className="absolute w-full h-full bg-emerald-500/20 rounded-full animate-ping"></div>
                    <div className="absolute w-24 h-24 bg-emerald-500/40 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                    <div className="relative w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 z-10 p-1">
                        <img src="/FC-logo.png" alt="FC Logo Pin" className="w-full h-full rounded-full object-cover border-2 border-white" />
                    </div>
                </div>

                <div className="h-8 mb-6 flex items-center justify-center">
                    <p className="text-center font-bold text-lg text-emerald-400 animate-pulse">
                        {searchingTexts[textIndex]}
                    </p>
                </div>

                <Button variant="destructive" onClick={handleManualCancel} className="w-full font-bold">
                    Cancel Request
                </Button>
            </div>
        </ResponsiveModal>
    );
}
