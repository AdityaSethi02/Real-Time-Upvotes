"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import axios from "axios"
import Spinner from "@/components/Spinner"

export default function CardWithForm() {
    const [adminName, setAdminName] = useState("");
    const [roomName, setRoomName] = useState("");
    const [chatCoolDown, setChatCoolDown] = useState("");
    const [upvoteCoolDown, setUpvoteCoolDown] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const NEXT_BACKEND_URL = process.env.NEXT_BACKEND_URL;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Card className="w-[350px] bg-black">
            <div className="flex items-center p-2 pb-5 justify-between w-full">
                <div className="flex-1 flex justify-start">
                    <button onClick={async () => {
                        router.push('/')
                    }} className="px-2 rounded text-white text-2xl font-black">
                    &#8592;
                    </button>
                </div>
                <div className="text-center flex-1 text-3xl font-bold text-white">CREATE</div>
                <div className="flex-1" />
            </div>
        <CardContent>
            <form>
            <div className="grid w-full items-center gap-4 text-white">
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="adminName">Name</Label>
                    <Input onChange={(e) => {
                        setAdminName(e.target.value)
                    }} id="adminName" placeholder="John Doe"/>
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input onChange={(e) => {
                        setRoomName(e.target.value)
                    }} id="roomName" placeholder="Room 1" />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="chatCoolDown">Chat Cool Down Time</Label>
                    <Select onValueChange={(e) => {
                        setChatCoolDown(e)
                    }}>
                        <SelectTrigger id="chatCoolDown">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="0sec">0 seconds</SelectItem>
                            <SelectItem value="5sec">5 seconds</SelectItem>
                            <SelectItem value="10sec">10 seconds</SelectItem>
                            <SelectItem value="15sec">15 seconds</SelectItem>
                            <SelectItem value="20sec">20 seconds</SelectItem>
                            <SelectItem value="25sec">25 seconds</SelectItem>
                            <SelectItem value="30sec">30 seconds</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col space-y-1.5">
                <Label htmlFor="upvoteCoolDownTime">Upvote Cool Down Time</Label>
                <Select onValueChange={(e) => {
                    setUpvoteCoolDown(e)
                }}>
                    <SelectTrigger id="upvoteCoolDownTime">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem value="0sec">0 seconds</SelectItem>
                        <SelectItem value="5sec">5 seconds</SelectItem>
                        <SelectItem value="10sec">10 seconds</SelectItem>
                        <SelectItem value="15sec">15 seconds</SelectItem>
                        <SelectItem value="20sec">20 seconds</SelectItem>
                        <SelectItem value="25sec">25 seconds</SelectItem>
                        <SelectItem value="30sec">30 seconds</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
            </form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button onClick={async () => {
                setLoading(true);
                const adminId = Math.floor(Math.random() * 1000000).toString();
                if (!NEXT_BACKEND_URL) {
                    console.error("BACKEND_URL is not defined");
                    setLoading(false);
                    return;
                }
                const response = await axios.post(NEXT_BACKEND_URL, {
                    adminName,
                    adminId,
                    roomName,
                    chatCoolDown,
                    upvoteCoolDown
                });

                const roomId = (response.data as { room: { roomId: string } }).room.roomId;

                console.log(response.data);
                router.push(`/room/${roomId}`);
            }} disabled={loading} className="bg-gray-800 text-white hover:bg-blue-500 relative flex items-center justify-center min-w-[120px] min-h-[40px]">
                {loading ? <Spinner /> : "Create Room"}
            </Button>
        </CardFooter>
        </Card>
    </div>
  )
}