"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const handleCreate = () => {
        router.push('/admin/create')
    }

    const handleJoin = () => {
        router.push('/user/join')
    }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <Card className="w-[550px] bg-black">
        <CardHeader className="flex justify-between">
          <CardTitle className="text-center text-white">
            WELCOME TO CHATBOARD
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            The Ultimate Upvote Chatroom
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between">
          <Button onClick={handleCreate} className="bg-gray-800 text-white hover:bg-blue-500">Create Room</Button>
          <Button onClick={handleJoin} className="bg-gray-800 text-white hover:bg-blue-500">Join Room</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
