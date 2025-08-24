"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MOCK_MODE } from '@/lib/mock';

type PaymentEffect = 'rare' | 'super_rare';
type ChargeEffect = 'charge_success'; // Define a type for charge effect

interface AppContextType {
  isMockMode: boolean;
  toggleMockMode: () => void;
  isBoostTime: boolean;
  setBoostTime: (isBoosting: boolean) => void;
  paymentEffect: PaymentEffect | null;
  triggerPaymentEffect: (effect: PaymentEffect) => void;
  chargeEffect: ChargeEffect | null; // Add chargeEffect to context type
  triggerChargeEffect: (effect: ChargeEffect) => void; // Add triggerChargeEffect
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isMockMode, setIsMockMode] = useState<boolean>(MOCK_MODE);
  const [isBoostTime, setIsBoostTime] = useState<boolean>(false);
  const [paymentEffect, setPaymentEffect] = useState<PaymentEffect | null>(null);
  const [chargeEffect, setChargeEffect] = useState<ChargeEffect | null>(null); // Add chargeEffect state

  const toggleMockMode = () => {
    if (process.env.NODE_ENV === 'development') {
      setIsMockMode(prev => !prev);
      console.warn("Toggled mock mode:", !isMockMode);
      window.location.reload();
    } else {
      console.warn("Mock mode can only be changed in development.");
    }
  };

  const setBoostTime = (isBoosting: boolean) => {
    setIsBoostTime(isBoosting);
  }

  const triggerPaymentEffect = (effect: PaymentEffect) => {
    setPaymentEffect(effect);
  };

  const triggerChargeEffect = (effect: ChargeEffect) => { // Add triggerChargeEffect function
    setChargeEffect(effect);
  };

  // Reset the effect after animation duration
  useEffect(() => {
    if (paymentEffect) {
      const timer = setTimeout(() => setPaymentEffect(null), 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [paymentEffect]);

  // Reset charge effect after animation duration
  useEffect(() => {
    if (chargeEffect) {
      const timer = setTimeout(() => setChargeEffect(null), 1000); // Adjust duration as needed for charge animation
      return () => clearTimeout(timer);
    }
  }, [chargeEffect]);

  return (
    <AppContext.Provider value={{ isMockMode, toggleMockMode, isBoostTime, setBoostTime, paymentEffect, triggerPaymentEffect, chargeEffect, triggerChargeEffect }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
