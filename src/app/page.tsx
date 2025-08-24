"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { motion, Variants, circOut, useSpring, useMotionValueEvent } from "framer-motion"; // Import useSpring and useMotionValueEvent
import PaymentButton from "@/components/payment/PaymentButton";
import RankingList from "@/components/ranking/RankingList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FaBolt } from "react-icons/fa";
import { easeInOut } from "framer-motion";
import { useEffect, useState } from "react"; // Import useEffect and useState


const pageVariants: Variants = {
  initial: { x: 0, scale: 1 },
  shake: { 
    x: [0, -8, 8, -8, 8, 0], 
    transition: { duration: 0.4 } 
  },
  jolt: { 
    scale: [1, 1.02, 0.98, 1], 
    transition: { duration: 0.3 } 
  },
};

const balanceVariants = {
  initial: {
    scale: 1,
    color: "#e5e7eb", // gray-200
  },
  highlight: {
    scale: [1, 1.25, 1],
    color: ["#e5e7eb", "#fef08a", "#e5e7eb"], // gray-200, yellow-200, gray-200
    transition: {
      duration: 0.5,
      ease: easeInOut,
    },
  },
  chargeHighlight: { // New variant for charge animation
    scale: [1, 1.1, 1],
    color: ["#e5e7eb", "#84cc16", "#e5e7eb"], // gray-200, lime-500, gray-200
    transition: {
      duration: 0.8, // Faster animation for charge
      ease: easeInOut,
    },
  },
};


export default function Home() {
  const { user, loading } = useAuth();
  const { paymentEffect, chargeEffect } = useApp(); // Get chargeEffect from useApp

  const animatedBalance = useSpring(user?.balance || 0, { stiffness: 100, damping: 20 }); // Framer Motion spring for animation
  const [displayBalance, setDisplayBalance] = useState(user?.balance || 0); // State for displayed balance

  useEffect(() => {
    if (user?.balance !== undefined) {
      animatedBalance.set(user.balance); // Always animate to the new user.balance
    }
  }, [user?.balance]); // Re-run when user.balance changes

  // Update displayBalance state when animatedBalance changes
  useMotionValueEvent(animatedBalance, "change", (latest) => {
    setDisplayBalance(Math.round(latest));
  });

  // Initialize animatedBalance when user is first loaded
  useEffect(() => {
    if (!loading && user?.balance !== undefined) {
      animatedBalance.set(user.balance);
      setDisplayBalance(user.balance); // Set initial display balance without animation
    }
  }, [loading, user?.balance]); // Only run once when user is loaded


  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-12 sm:py-16 md:py-24"
      variants={pageVariants}
      animate={paymentEffect === 'super_rare' ? 'jolt' : paymentEffect === 'rare' ? 'shake' : 'initial'}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
          The Price of Honor
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
          Climb the leaderboard by proving your commitment. Here, status is not given—it's purchased.
        </p>
      </motion.div>

      {user ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-12 flex flex-col items-center gap-8"
        >
          <div className="flex items-center justify-between w-full max-w-lg p-6 bg-card/80 border border-border rounded-2xl shadow-xl backdrop-blur-lg">
            <div>
              <p className="text-sm text-muted-foreground">BALANCE</p>
              <motion.p 
                className="text-3xl font-bold text-gray-100"
                variants={balanceVariants}
                animate={chargeEffect === 'charge_success' ? 'chargeHighlight' : (paymentEffect ? 'highlight' : 'initial')}
              >
                {displayBalance.toLocaleString()} <span className="text-lg text-muted-foreground">JPY</span> {/* Use displayBalance */}
              </motion.p>
              <p className="text-lg text-muted-foreground mt-1">
                Total Paid: {user.totalPaid.toLocaleString()} JPY
              </p>
            </div>
            <Button asChild size="lg" className="h-auto py-3 px-6 text-lg font-semibold">
              <Link href="/charge">
                <FaBolt className="mr-2 h-4 w-4" />
                Charge
              </Link>
            </Button>
          </div>
          
          <PaymentButton />

        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-16 text-center flex flex-col items-center gap-4"
        >
          <p className="text-xl font-semibold">Log in to begin your ascent.</p>
          <p className="text-muted-foreground">Join the ranks and immortalize your dedication.</p>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-24 md:mt-32"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-primary to-white text-transparent bg-clip-text">
            Real-time Honor Ranking
        </h2>
        <RankingList />
      </motion.div>
    </motion.div>
  );
}

const LoadingSkeleton = () => (
  <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
    <div className="text-center">
      <Skeleton className="h-12 md:h-16 w-3/4 mx-auto" />
      <Skeleton className="h-6 md:h-7 w-1/2 mx-auto mt-4" />
    </div>
    <div className="mt-12 flex flex-col items-center gap-8">
      <Skeleton className="h-28 w-full max-w-lg rounded-2xl" />
      <Skeleton className="h-24 w-64 rounded-xl" />
    </div>
    <div className="mt-24 md:mt-32">
      <Skeleton className="h-10 w-1/3 mx-auto mb-10" />
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  </div>
);
