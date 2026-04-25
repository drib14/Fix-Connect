import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';
import { ResponsiveModal } from './ResponsiveModal';
import { Button } from './ui/button';
import { Briefcase, CreditCard, Wallet, Calendar, MapPin, Search } from 'lucide-react';

export function SearchingWorkerModal({ isOpen, setIsOpen, bookingId, bookingDetails }) {
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

    const [showNoWorkerModal, setShowNoWorkerModal] = useState(false);

    const handleAutoCancel = () => {
        setShowNoWorkerModal(true);
    };

    const handleKeepWaiting = () => {
        setShowNoWorkerModal(false);
        setTimeLeft(180); // Reset timer for another 3 minutes
    };

    const handleRebook = async () => {
        // Cancel current silently then reload to allow rebooking
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/bookings/${bookingId}/cancel`, {
                reason: 'Rebooking because no worker found'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsOpen(false);
            setShowNoWorkerModal(false);
            window.location.reload();
        } catch (err) {
            console.error("Failed to cancel for rebook", err);
            window.location.reload();
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

    if (!isOpen && !showNoWorkerModal) return null;

    return (
        <>
        <ResponsiveModal
            title="Requesting..."
            description="Please don't close this window."
            open={isOpen && !showNoWorkerModal}
            onOpenChange={() => {}} // prevent manual close
        >
            <div className="flex flex-col py-6 max-h-[80vh] overflow-y-auto">
                <div className="flex flex-col items-center mb-6">
                    {/* Custom Pin Radar Animation */}
                    <div className="relative flex justify-center items-center w-24 h-24 mb-4">
                        <div className="absolute w-full h-full bg-emerald-500/20 rounded-full animate-ping"></div>
                        <div className="absolute w-20 h-20 bg-emerald-500/40 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                        <div className="relative w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 z-10 p-1">
                            <img src="/FC-logo.png" alt="FC Logo Pin" className="w-full h-full rounded-full object-cover border-2 border-white" />
                        </div>
                    </div>

                    <div className="h-6 mb-2 flex items-center justify-center">
                        <p className="text-center font-bold text-md text-emerald-400 animate-pulse">
                            {searchingTexts[textIndex]}
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground">This may take a few minutes. Please keep this window open.</p>
                </div>

                {bookingDetails && (
                    <div className="bg-card border border-border/50 rounded-xl p-4 mb-6 shadow-sm space-y-4">
                        <h4 className="font-semibold text-emerald-500 flex items-center gap-2 border-b border-border/50 pb-2">
                            <Search className="w-4 h-4" /> Request Breakdown
                        </h4>

                        <div className="grid grid-cols-1 gap-3 text-sm">
                            <div className="flex items-start gap-3">
                                <Briefcase className="w-4 h-4 text-emerald-400 mt-1" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Service</p>
                                    <p className="font-medium">{bookingDetails.serviceCategory || 'Service Request'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-emerald-400 mt-1" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Requested</p>
                                    <p className="font-medium">
                                        {bookingDetails.createdAt ? new Date(bookingDetails.createdAt).toLocaleString() : 'Just now'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border/50 pt-3 mt-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-muted-foreground text-sm">Base Fee</span>
                                <span className="font-medium">₱{bookingDetails.priceAtBooking ? bookingDetails.priceAtBooking.toFixed(2) : (bookingDetails.totalAmount ? (bookingDetails.totalAmount / 1.12).toFixed(2) : '0.00')}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-muted-foreground text-sm">VAT (12%)</span>
                                <span className="font-medium">₱{bookingDetails.priceAtBooking ? (bookingDetails.priceAtBooking * 0.12).toFixed(2) : (bookingDetails.totalAmount ? (bookingDetails.totalAmount - (bookingDetails.totalAmount / 1.12)).toFixed(2) : '0.00')}</span>
                            </div>
                            <div className="flex justify-between items-center text-emerald-500 font-bold text-lg pt-2 border-t border-border/50">
                                <span>Total Amount</span>
                                <span>₱{bookingDetails.totalAmount ? bookingDetails.totalAmount.toFixed(2) : (bookingDetails.priceAtBooking ? (bookingDetails.priceAtBooking * 1.12).toFixed(2) : '0.00')}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 text-sm bg-background/50 p-2 rounded-lg border border-border/30">
                            {bookingDetails.paymentMethod === 'Cash' ? <Wallet className="w-4 h-4 text-emerald-400" /> : <CreditCard className="w-4 h-4 text-emerald-400" />}
                            <span className="font-medium">Payment: {bookingDetails.paymentMethod || 'Cash'}</span>
                        </div>
                    </div>
                )}

                <Button variant="destructive" onClick={handleManualCancel} className="w-full font-bold py-6 text-md rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                    Cancel Request
                </Button>
            </div>
        </ResponsiveModal>

        <ResponsiveModal isOpen={showNoWorkerModal} setIsOpen={setShowNoWorkerModal} title="No Workers Found">
            <div className="space-y-6 pt-4 pb-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto border border-yellow-500/30">
                        <Search className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">We're having trouble finding a worker</h3>
                    <p className="text-muted-foreground">All of our available workers in your area are currently busy. What would you like to do?</p>
                </div>

                <div className="space-y-3 pt-4">
                    <Button onClick={handleKeepWaiting} className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl">
                        Keep Waiting (3 more minutes)
                    </Button>
                    <Button onClick={handleRebook} variant="outline" className="w-full font-bold py-6 rounded-xl border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400">
                        Cancel & Try Another Service
                    </Button>
                    <Button onClick={handleManualCancel} variant="ghost" className="w-full font-bold py-6 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300">
                        Just Cancel
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
        </>
    );
}
