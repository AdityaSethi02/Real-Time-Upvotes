"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function CardWithForm() {
    const [adminName, setAdminName] = useState("");
    const [roomName, setRoomName] = useState("");
    const [chatCoolDown, setChatCoolDown] = useState("");
    const [upvoteCoolDown, setUpvoteCoolDown] = useState("");
    const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Card className="w-[350px] bg-black">
        <CardHeader className="flex justify-between">
            <CardTitle className="text-center text-white">CREATE ROOM</CardTitle>
        </CardHeader>
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
                const adminId = Math.floor(Math.random() * 1000000).toString();
                const response = await axios.post("http://localhost:3000/api/admin", {
                    adminName,
                    adminId,
                    roomName,
                    chatCoolDown,
                    upvoteCoolDown
                });
                console.log(response.data);
                router.push("/home")
            }} className="bg-gray-800 text-white hover:bg-blue-500">Create</Button>
        </CardFooter>
        </Card>
    </div>
  )
}