"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { PAYMENT_AMOUNTS, RARE_CHANCES, CLICK_RATE_LIMIT } from '@/constants';
import { cn } from '@/lib/utils';
import { FaYenSign } from 'react-icons/fa';
import { useApp } from '@/contexts/AppContext';

const PaymentButton = () => {
    const { user, firebaseUser, updateMockUser } = useAuth();
    const { isMockMode, isBoostTime, triggerPaymentEffect } = useApp();
    const [amount, setAmount] = useState(PAYMENT_AMOUNTS.DEFAULT);
    const [isLoading, setIsLoading] = useState(false);
    const [lastClickTime, setLastClickTime] = useState(0);

    const playSound = (sound: 'click' | 'rare' | 'error') => {
        // Implement sound effects here if desired
    };

    const determineAmount = useCallback(() => {
        if (isBoostTime) return PAYMENT_AMOUNTS.BOOST;
        
        const random = Math.random();
        if (random < RARE_CHANCES.HUNDRED) return PAYMENT_AMOUNTS.RARE_100;
        if (random < RARE_CHANCES.TEN) return PAYMENT_AMOUNTS.RARE_10;
        return PAYMENT_AMOUNTS.DEFAULT;
    }, [isBoostTime]);

    useEffect(() => {
        setAmount(determineAmount());
    }, [determineAmount]);

    const handlePayment = async () => {
        if (!user || !firebaseUser) {
            toast.error("Please log in to make a payment.");
            return;
        }
        if (isLoading) return;

        const now = Date.now();
        if (now - lastClickTime < 1000 / CLICK_RATE_LIMIT.PER_SECOND) {
            return;
        }
        setLastClickTime(now);
        
        setIsLoading(true);
        playSound(amount > 1 ? 'rare' : 'click');

        try {
            if (isMockMode) {
                if (user.balance < amount) {
                    throw new Error("Insufficient balance for mock payment.");
                }
                updateMockUser({
                    balance: user.balance - amount,
                    totalPaid: user.totalPaid + amount,
                });
            } else {
                const token = await firebaseUser.getIdToken();
                const response = await fetch('/api/pay', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ userId: user.uid, amount }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Payment failed");
            }

            // Trigger payment effects
            if (amount === PAYMENT_AMOUNTS.RARE_100) {
                triggerPaymentEffect('super_rare');
            } else if (amount === PAYMENT_AMOUNTS.RARE_10) {
                triggerPaymentEffect('rare');
            }

            toast.success(
                <div className="flex items-center gap-2">
                    <span className="text-lg">💸</span>
                    <span>Successfully paid {amount}円!</span>
                </div>
            );
        } catch (error: any) {
            playSound('error');
            toast.error(error.message);
        } finally {
            setIsLoading(false);
            setAmount(determineAmount());
        }
    };

    const buttonStyles = {
        [PAYMENT_AMOUNTS.DEFAULT]: "bg-primary/80 hover:bg-primary text-primary-foreground",
        [PAYMENT_AMOUNTS.RARE_10]: "bg-amber-500/80 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/30",
        [PAYMENT_AMOUNTS.RARE_100]: "bg-rose-600/80 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/40 animate-pulse",
        [PAYMENT_AMOUNTS.BOOST]: "bg-purple-600/80 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/40 animate-pulse",
    };

    return (
        <motion.div whileHover={{ scale: isLoading ? 1 : 1.05 }} whileTap={{ scale: isLoading ? 1 : 0.95 }}>
            <Button
                onClick={handlePayment}
                disabled={isLoading}
                className={cn(
                    "h-24 w-64 text-2xl font-bold rounded-xl shadow-lg transition-all duration-300 ease-in-out transform",
                    buttonStyles[amount],
                    isLoading && "opacity-60 cursor-not-allowed"
                )}
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={amount}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center"
                    >
                        <FaYenSign className="mr-3" /> {amount.toLocaleString()}円を支払う
                    </motion.span>
                </AnimatePresence>
            </Button>
        </motion.div>
    );
};

export default PaymentButton;
