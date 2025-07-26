"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getStripeJs } from '@/lib/stripe/client';
import { CHARGE_AMOUNTS, MIN_CHARGE_AMOUNT } from '@/constants';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { FaArrowLeft } from 'react-icons/fa';

const ChargePage = () => {
    const { user, firebaseUser, updateMockUser } = useAuth();
    const { isMockMode } = useApp();
    const router = useRouter();
    const [selectedAmount, setSelectedAmount] = useState<number>(CHARGE_AMOUNTS[1]);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCharge = async () => {
        if (!user || !firebaseUser) {
            toast.error("Please log in to charge your account.");
            return;
        }

        const amount = customAmount ? parseInt(customAmount, 10) : selectedAmount;

        if (isNaN(amount) || amount < MIN_CHARGE_AMOUNT) {
            toast.error(`Minimum charge amount is ${MIN_CHARGE_AMOUNT} JPY.`);
            return;
        }

        setIsLoading(true);
        
        try {
            if (isMockMode) {
                // Simulate charge in mock mode
                updateMockUser({
                    balance: user.balance + amount,
                });
                toast.success(`Mock charge of ${amount} JPY successful!`);
                router.push('/');
            } else {
                toast.info("Redirecting to payment page...");
                const response = await fetch('/api/charge', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.uid, amount }),
                });

                const { sessionId, error } = await response.json();
                if (error) throw new Error(error);

                const stripe = await getStripeJs();
                if (!stripe) throw new Error("Stripe.js is not loaded.");
                await stripe.redirectToCheckout({ sessionId });
            }
        } catch (error: any) {
            toast.error(error.message);
            setIsLoading(false);
        }
    };

    const amountToCharge = customAmount ? parseInt(customAmount, 10) : selectedAmount;

    return (
        <div className="container mx-auto px-4 py-12 sm:py-16">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg mx-auto bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-2xl p-8 relative"
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="absolute top-5 left-5 text-muted-foreground hover:text-foreground hover:bg-accent"
                    aria-label="Go back"
                >
                    <FaArrowLeft className="h-5 w-5" />
                </Button>

                <h1 className="text-3xl font-bold text-center mb-2 text-foreground">Charge Your Balance</h1>
                <p className="text-muted-foreground text-center mb-8">Select an amount or enter a custom value.</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    {CHARGE_AMOUNTS.map(amount => (
                        <Button
                            key={amount}
                            variant={selectedAmount === amount && !customAmount ? 'default' : 'secondary'}
                            onClick={() => {
                                setSelectedAmount(amount);
                                setCustomAmount('');
                            }}
                            className="py-6 text-lg font-semibold"
                        >
                            {amount.toLocaleString()}
                        </Button>
                    ))}
                </div>

                <div className="mb-6">
                    <label htmlFor="custom-amount" className="block text-sm font-medium text-muted-foreground mb-2">Or enter a custom amount</label>
                    <Input
                        type="number"
                        id="custom-amount"
                        placeholder={`e.g., 5000 (min ${MIN_CHARGE_AMOUNT} JPY)`}
                        value={customAmount}
                        onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setSelectedAmount(0);
                        }}
                        className="py-6 text-lg"
                    />
                </div>

                <Button
                    onClick={handleCharge}
                    disabled={isLoading || isNaN(amountToCharge) || amountToCharge < MIN_CHARGE_AMOUNT}
                    className="w-full py-7 text-xl font-bold"
                    size="lg"
                >
                    {isLoading ? "Processing..." : `Charge ${amountToCharge.toLocaleString()} JPY`}
                </Button>
            </motion.div>
        </div>
    );
};

export default ChargePage;
