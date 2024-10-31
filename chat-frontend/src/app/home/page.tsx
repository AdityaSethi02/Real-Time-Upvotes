"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const handleCreate = () => {
        router.push('/create')
    }

    const handleJoin = () => {
        router.push('/join')
    }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <Card className="w-[359px] bg-black">
        <CardHeader className="flex justify-between">
          <CardTitle className="text-center text-white">
            WELCOME TO CHATBOARD
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex justify-between">
          <Button onClick={handleCreate} className="bg-gray-800 text-white hover:bg-blue-500">Create Room</Button>
          <Button onClick={handleJoin} className="bg-gray-800 text-white hover:bg-blue-500">Join Room</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
