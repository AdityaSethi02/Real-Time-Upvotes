"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
        <CardHeader className="flex justify-between">
            <CardTitle className="text-center text-white">JOIN ROOM</CardTitle>
        </CardHeader>
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
                const response = await axios.post("http://localhost:3000/api/user", {
                    userName,
                    roomId,
                    userId
                });
                console.log(response.data);
                router.push("/home");
            }}className="bg-gray-800 text-white hover:bg-blue-500">Join</Button>
        </CardFooter>
        </Card>
    </div>
  )
}
