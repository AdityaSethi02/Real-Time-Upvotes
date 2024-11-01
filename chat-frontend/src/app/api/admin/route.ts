
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

interface CreateAdminAndRoomRequest {
    adminName: string;
    adminId: string;
    roomName: string;
    chatCoolDown: number;
    upvoteCoolDown: number;
}

export async function POST(req: NextRequest) {
    const { adminName, adminId, roomName, chatCoolDown, upvoteCoolDown }: CreateAdminAndRoomRequest = await req.json();

    const parsedChatCoolDown = parseInt(chatCoolDown.toString().replace("sec", ""));
    const parsedUpvoteCoolDown = parseInt(upvoteCoolDown.toString().replace("sec", ""));
    try {
        console.log("here 1")
        const room = await client.room.create({
            data: {
                roomName,
                chatCoolDown: parsedChatCoolDown,
                upvoteCoolDown: parsedUpvoteCoolDown
            }
        });

        console.log("here 2")
        const admin = await client.admin.create({
            data: {
                adminName,
                adminId,
                roomId: room.roomId
            }
        });

        return NextResponse.json({ admin, room });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error creating admin and room" });
    }
}