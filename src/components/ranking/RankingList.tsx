"use client";

import { useRanking } from '@/hooks/useRanking';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaCrown, FaMedal } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const RankingList = () => {
    const { ranking, loading, error } = useRanking();

    if (loading) return <RankingSkeleton />;
    if (error) return <p className="text-center text-destructive">Failed to load ranking: {error.message}</p>;
    if (ranking.length === 0) return <p className="text-center text-muted-foreground">No one is on the ranking yet. Be the first!</p>;

    return (
        <div className="w-full max-w-3xl mx-auto">
            <motion.ul
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                className="space-y-3"
            >
                {ranking.map((item) => (
                    <RankingItem key={item.user.uid} item={item} />
                ))}
            </motion.ul>
        </div>
    );
};

const RankingItem = ({ item }: { item: ReturnType<useRanking>['ranking'][0] }) => {
    const rank = item.rank;
    const rankStyles = {
        1: "border-yellow-400/80 bg-yellow-400/10 hover:bg-yellow-400/20",
        2: "border-slate-400/80 bg-slate-400/10 hover:bg-slate-400/20",
        3: "border-amber-600/80 bg-amber-600/10 hover:bg-amber-600/20",
    };

    return (
        <motion.li
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
                "flex items-center p-4 rounded-xl border transition-all duration-300",
                rank <= 3 ? rankStyles[rank] : "border-border bg-card/50 hover:bg-accent/50"
            )}
        >
            <div className="flex items-center justify-center w-12">
                <RankIcon rank={rank} />
            </div>
            <Image
                src={item.user.photoURL || '/default-avatar.png'}
                alt={item.user.displayName || 'User'}
                width={48}
                height={48}
                className="rounded-full mr-4 border-2 border-white/20"
            />
            <div className="flex-1">
                <p className="font-bold text-lg text-foreground">{item.user.displayName}</p>
                <p className="text-sm text-muted-foreground">Rank: {rank}</p>
            </div>
            <div className="font-bold text-xl text-primary tracking-tight">
                {item.totalPaid.toLocaleString()} 円
            </div>
        </motion.li>
    );
};

const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <FaCrown className="text-2xl text-yellow-400" />;
    if (rank === 2) return <FaMedal className="text-2xl text-slate-400" />;
    if (rank === 3) return <FaMedal className="text-2xl text-amber-600" />;
    return <span className="text-xl font-bold text-muted-foreground">{rank}</span>;
};

const RankingSkeleton = () => (
    <div className="w-full max-w-3xl mx-auto space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center p-4 rounded-xl border border-border bg-card/50">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full mx-4" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-6 w-1/5" />
            </div>
        ))}
    </div>
);

export default RankingList;
