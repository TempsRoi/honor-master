import { RankingItem, UserProfile } from "@/types";

const mockUsers: UserProfile[] = Array.from({ length: 100 }, (_, i) => ({
    uid: `mock-user-${i + 1}`,
    displayName: `Ranker ${i + 1}`,
    photoURL: `https://i.pravatar.cc/150?u=ranker${i + 1}`,
    email: `ranker${i+1}@example.com`,
    balance: Math.floor(Math.random() * 10000),
    totalPaid: 100000 - (i * 1000) - Math.floor(Math.random() * 1000),
}));

export const getMockRanking = (): RankingItem[] => {
    return mockUsers
        .sort((a, b) => b.totalPaid - a.totalPaid)
        .slice(0, 100)
        .map((user, i) => ({
            rank: i + 1,
            user: {
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL,
            },
            totalPaid: user.totalPaid,
        }));
};
