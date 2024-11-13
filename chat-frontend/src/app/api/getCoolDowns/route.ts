import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const url = new URL(req.url)
    const roomId = url.searchParams.get('roomId');

    try {
        const room = await prisma.room.findUnique({
            where: {
                roomId: roomId as string
            },
            select: {
                chatCoolDown: true,
                upvoteCoolDown: true
            }
        });

        if (room) {
            return NextResponse.json(room);
        } else {
            return NextResponse.json({ error: "Room not found" });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error getting room cool downs" });
    } finally {
        await prisma.$disconnect();
    }
}