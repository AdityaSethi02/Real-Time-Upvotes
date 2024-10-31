"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function CardWithForm() {
    const router = useRouter();
    const handleJoin = () => {
        router.push("/user/roomId")
    }

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
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="John Doe" />
                </div>
                <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Room Code</Label>
                <Input id="name" placeholder="Room 1" />
                </div>
            </div>
            </form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button onClick={handleJoin}className="bg-gray-800 text-white hover:bg-blue-500">Join</Button>
        </CardFooter>
        </Card>
    </div>
  )
}
