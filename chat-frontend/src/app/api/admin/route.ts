
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


interface CreateAdminAndRoomRequest {
    adminName: string;
    adminId: string;
    roomName: string;
    chatCoolDown: number;
    upvoteCoolDown: number;
}

export async function POST(req: NextRequest) {
    const prisma = new PrismaClient();
    const { adminName, adminId, roomName, chatCoolDown, upvoteCoolDown }: CreateAdminAndRoomRequest = await req.json();

    const parsedChatCoolDown = parseInt(chatCoolDown.toString().replace("sec", ""));
    const parsedUpvoteCoolDown = parseInt(upvoteCoolDown.toString().replace("sec", ""));
    try {
        const room = await prisma.room.create({
            data: {
                roomName,
                chatCoolDown: parsedChatCoolDown,
                upvoteCoolDown: parsedUpvoteCoolDown
            }
        });

        const admin = await prisma.admin.create({
            data: {
                adminName,
                adminId,
                roomId: room.roomId
            }
        });

        const redirectUrl = `${req.nextUrl.origin}/room/${room.roomId}`;

        NextResponse.redirect(redirectUrl);
        return NextResponse.json({ admin, room });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error creating admin and room", details: error });
    }
}

export async function GET(req: NextRequest) {
    const prisma = new PrismaClient();
    const url = new URL(req.url)
    const roomId = url.searchParams.get('roomId');

    try {
        const admin = await prisma.admin.findFirst({
            where: {
                roomId: roomId as string
            },
            select: {
                adminId: true,
                adminName: true,
            }
        });

        if (admin) {
            return NextResponse.json(admin);
        } else {
            const redirectUrl = `${req.nextUrl.origin}/admin/create`;
            NextResponse.redirect(redirectUrl);
            return NextResponse.json({
                msg: "Room not found, create room first"
            })
        }

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error getting room cool downs" });
    } finally {
        await prisma.$disconnect();
    }
}