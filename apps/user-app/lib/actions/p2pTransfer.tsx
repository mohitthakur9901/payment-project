"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function p2pTransfer(to: string, amount: number) {
    const session = await getServerSession(authOptions);
    const from = session?.user?.id;
    
    if (!from) {
        return {
            message: "Error while sending"
        }
    }
    const toUser = await prisma.user.findFirst({
        where: {
            number: to
        }
    });

    if (!toUser) {
        return {
            message: "User not found"
        }
    }
    try {
        await prisma.$transaction(async (tx) => {
            const fromBalance = await tx.balance.findUnique({
                where: { userId: Number(from) },
            });
   
            if (!fromBalance || fromBalance.amount < amount) {
                throw new Error('Insufficient funds');
            }
            await tx.balance.update({
                where: { userId: Number(from) },
                data: { amount: { decrement: amount } },
            });

            await tx.balance.upsert({
                where: { userId: Number(toUser.id) },
                update: { amount: { increment: amount } },
                create: { userId: Number(toUser.id), amount: amount  , locked : amount },
            });
    
            await tx.p2pTransfer.create({
                data : {
                    fromUserId : Number(from),
                    toUserId : Number(toUser.id),
                    amount : amount,
                    timestamp: new Date()
                }
            })
        });
    } catch (error) {
        console.error('Error in database operation:', error);


    }
}