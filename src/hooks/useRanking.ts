"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { RankingItem, UserProfile } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { getMockRanking } from '@/lib/mock-ranking';
import { RANKING_LIMIT } from '@/constants';

export const useRanking = () => {
    const { isMockMode } = useApp();
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (isMockMode) {
            setRanking(getMockRanking());
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'users'),
            orderBy('totalPaid', 'desc'),
            limit(RANKING_LIMIT)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newRanking = querySnapshot.docs.map((doc, index) => {
                const data = doc.data() as UserProfile;
                return {
                    rank: index + 1,
                    user: {
                        uid: data.uid,
                        displayName: data.displayName,
                        photoURL: data.photoURL,
                    },
                    totalPaid: data.totalPaid,
                };
            });
            setRanking(newRanking);
            setLoading(false);
        }, (err) => {
            console.error("Ranking snapshot error:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isMockMode]);

    return { ranking, loading, error };
};
