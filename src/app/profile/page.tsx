"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PaymentHistory } from '@/types';
import { toast } from 'sonner';
import { FaYenSign, FaPlusCircle } from 'react-icons/fa';
import { cn } from '@/lib/utils';

const ProfilePage = () => {
    const { user, loading } = useAuth();
    const [history, setHistory] = useState<PaymentHistory[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchHistory = async () => {
                setIsHistoryLoading(true);
                try {
                    const response = await fetch(`/api/history?userId=${user.uid}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch history');
                    }
                    const data = await response.json();
                    setHistory(data);
                } catch (error: any) {
                    toast.error(error.message);
                } finally {
                    setIsHistoryLoading(false);
                }
            };
            fetchHistory();
        }
    }, [user]);

    if (loading) {
        return <div className="text-center p-10">Loading profile...</div>;
    }

    if (!user) {
        return <div className="text-center p-10">Please log in to view your profile.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row gap-8"
            >
                {/* Profile Card */}
                <div className="md:w-1/3">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                        <Image
                            src={user.photoURL || '/default-avatar.png'}
                            alt={user.displayName || 'User'}
                            width={128}
                            height={128}
                            className="rounded-full mx-auto mb-4 border-4 border-primary"
                        />
                        <h1 className="text-2xl font-bold">{user.displayName}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                        
                        <div className="mt-6 text-left space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Current Balance</p>
                                <p className="text-2xl font-bold text-green-500">{user.balance.toLocaleString()} 円</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Honor Paid</p>
                                <p className="text-2xl font-bold text-yellow-500">{user.totalPaid.toLocaleString()} 円</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="md:w-2/3">
                    <h2 className="text-2xl font-bold mb-4">Payment History</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-h-[600px] overflow-y-auto">
                        {isHistoryLoading ? (
                            <p>Loading history...</p>
                        ) : history.length > 0 ? (
                            <ul className="space-y-4">
                                {history.map(item => (
                                    <li key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center">
                                            {item.type === 'charge' ? (
                                                <FaPlusCircle className="text-green-500 mr-3 text-xl" />
                                            ) : (
                                                <FaYenSign className="text-red-500 mr-3 text-xl" />
                                            )}
                                            <div>
                                                <p className="font-semibold capitalize">{item.type}</p>
                                                <p className="text-sm text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <p className={cn("font-bold text-lg", item.type === 'charge' ? 'text-green-500' : 'text-red-500')}>
                                            {item.type === 'charge' ? '+' : '-'} {item.amount.toLocaleString()} 円
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No payment history found.</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
