"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function CardWithForm() {
    const [userName, setUserName] = useState("");
    const [roomId, setRoomId] = useState("");
    const router = useRouter();

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
                <div className="text-center flex-1 text-3xl font-bold text-white">JOIN</div>
                <div className="flex-1" />
            </div>
        <CardContent>
            <form>
            <div className="grid w-full items-center gap-4 text-white">
                <div className="flex flex-col space-y-1.5">
                <Label htmlFor="userName">Name</Label>
                <Input onChange={(e) => {
                    setUserName(e.target.value)
                }} id="userName" placeholder="John Doe" />
                </div>
                <div className="flex flex-col space-y-1.5">
                <Label htmlFor="roomId">Room Code</Label>
                <Input onChange={(e) => {
                    setRoomId(e.target.value)
                }} id="roomId" placeholder="Room 1" />
                </div>
            </div>
            </form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button onClick={async () => {
                const userId = Math.floor(Math.random() * 1000000).toString();
                const response = await axios.post(`https://chatboard-upvotes.vercel.app/api/user`, {
                    userName,
                    roomId,
                    userId
                });

                console.log(response.data);
                router.push(`/room/${roomId}`);
            }}className="bg-gray-800 text-white hover:bg-blue-500">Join</Button>
        </CardFooter>
        </Card>
    </div>
  )
}