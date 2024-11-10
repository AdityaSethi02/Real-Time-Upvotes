import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const client = new PrismaClient();

interface JoinRoomRequest {
    userName: string;
    roomId: string;
}

export async function POST(req: NextRequest) {
    const { userName, roomId }: JoinRoomRequest = await req.json();

    try {
        const room = await client.room.findUnique({
            where: {
                roomId
            }
        });

        if (!room) {
            return NextResponse.json({
                error: "Room does not exist"
            })
        }

        const user = await client.user.create({
            data: {
                userName,
                roomId
            }
        });
        
        const redirectUrl = `${req.nextUrl.origin}/room/${room.roomId}`;
        
        NextResponse.redirect(redirectUrl);
        return NextResponse.json({ user, room });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error joining room" });
    }
}