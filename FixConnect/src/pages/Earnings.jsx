import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Wallet, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Earnings() {
    const [earningsData, setEarningsData] = useState([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [pendingPayout, setPendingPayout] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');

                // Assuming we can fetch completed bookings for this worker
                const res = await axios.get(`/api/bookings/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success) {
                    const completedJobs = res.data.data.filter(b => b.status === 'completed');

                    // Mock calculation for the chart based on job completion dates
                    // A real app would aggregate this in the backend
                    let total = 0;
                    const chartData = [
                        { name: 'Mon', amount: 0 },
                        { name: 'Tue', amount: 0 },
                        { name: 'Wed', amount: 0 },
                        { name: 'Thu', amount: 0 },
                        { name: 'Fri', amount: 0 },
                        { name: 'Sat', amount: 0 },
                        { name: 'Sun', amount: 0 },
                    ];

                    completedJobs.forEach(job => {
                        const earned = job.priceAtBooking || 0; // Worker's cut (base fee without tax)
                        total += earned;
                        // Just randomizing it across the week for demo purposes
                        const randomDay = Math.floor(Math.random() * 7);
                        chartData[randomDay].amount += earned;
                    });

                    setTotalEarnings(total);
                    // Mock 10% of total is pending payout
                    setPendingPayout(total * 0.1);
                    setEarningsData(chartData);
                }
            } catch (err) {
                console.error("Failed to load earnings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, []);

    if (loading) return <div className="min-h-screen bg-background text-white flex justify-center items-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-background text-white p-6 pb-20">
            <div className="max-w-4xl mx-auto space-y-6 pt-20">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Earnings Dashboard</h1>
                    <Button asChild variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                        <Link to="/">Back to Dashboard</Link>
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card/50 border border-border rounded-xl p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <Wallet className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Total Earnings</p>
                            <p className="text-2xl font-bold">₱ {totalEarnings.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="bg-card/50 border border-border rounded-xl p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <TrendingUp className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Available for Payout</p>
                            <p className="text-2xl font-bold">₱ {pendingPayout.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="bg-card/50 border border-border rounded-xl p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Jobs Completed</p>
                            <p className="text-2xl font-bold">12</p>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-card/50 border border-border rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-emerald-400" />
                            Weekly Overview
                        </h2>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={earningsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="name" stroke="#888888" tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value}`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1a1b1e', border: '1px solid #2c2d31', borderRadius: '8px' }}
                                />
                                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-blue-500/20">
                        Request Cash Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
