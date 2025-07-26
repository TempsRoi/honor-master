"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import PaymentButton from "@/components/payment/PaymentButton";
import RankingList from "@/components/ranking/RankingList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FaBolt } from "react-icons/fa";

const pageVariants = {
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
  initial: { scale: 1, color: "#ffffff" },
  highlight: {
    scale: [1, 1.25, 1],
    color: ["#ffffff", "#fef08a", "#ffffff"],
    transition: { duration: 0.5, ease: "circOut" },
  },
};

export default function Home() {
  const { user, loading } = useAuth();
  const { paymentEffect } = useApp();

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
                className="text-3xl font-bold"
                variants={balanceVariants}
                animate={paymentEffect ? 'highlight' : 'initial'}
              >
                {user.balance.toLocaleString()} <span className="text-lg text-muted-foreground">JPY</span>
              </motion.p>
              <p className="text-xs text-muted-foreground mt-1">
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
