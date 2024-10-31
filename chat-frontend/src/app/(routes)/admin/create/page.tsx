"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CardWithForm() {
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
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="John Doe" />
                </div>
                <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Room Name</Label>
                <Input id="name" placeholder="Room 1" />
                </div>
                <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework">Chat Cool Down Time</Label>
                <Select>
                    <SelectTrigger id="framework">
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
                <Label htmlFor="framework">Upvote Cool Down Time</Label>
                <Select>
                    <SelectTrigger id="framework">
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
            <Button className="bg-gray-800 text-white hover:bg-blue-500">Create</Button>
        </CardFooter>
        </Card>
    </div>
  )
}
