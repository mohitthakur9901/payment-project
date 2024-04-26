import { getServerSession } from "next-auth";
import { SendCard } from "../../../components/SendCard";
import { authOptions } from "../../../lib/auth";
import prisma from "@repo/db/client";
import React from "react";

export default async function () {
    const transactions = await getP2pTransactions();
    
    return (
        <div className="flex items-center justify-around">
            <SendCard />
            {transactions.map((t) => (
                <div className="flex flex-col items-center" key={t.id}>
                    <p>Amount: {t.amount}</p>
                    <p>Date: {t.time.toDateString()}</p>
                </div>
            ))}
        </div>
    );

}

async function getP2pTranscations() {
    const session = await getServerSession(authOptions);
    const p2p = await prisma.p2pTransfer.findMany({
        where: {
            fromUserId: Number(session?.user?.id)
        }
    });
    return p2p.map(t => ({
        amount: t.amount,
        time: t.timestamp,
        id: t.id,
    }))

}


type P2PTransaction = {
    id: number;
    amount: number;
    time: Date;
};
async function getP2pTransactions(): Promise<P2PTransaction[]> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error("User session not found");
    }

    const p2pTransfers = await prisma.p2pTransfer.findMany({
        where: {
            fromUserId: Number(session.user.id)
        }
    });

    const transactions: P2PTransaction[] = p2pTransfers.map((transfer) => ({
        id: transfer.id,
        amount: transfer.amount,
        time: transfer.timestamp
    }));

    return transactions;
}