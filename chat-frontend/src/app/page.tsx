"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function Home() {
    const router = useRouter();
	const [loading, setLoading] = useState({ create: false, join: false });

    const handleCreate = () => {
		setLoading({...loading, create: true});
        router.push('/admin/create')
    }

    const handleJoin = () => {
		setLoading({...loading, join: true});
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
					<Button onClick={handleCreate} disabled={loading.create} className="bg-gray-800 text-white hover:bg-blue-500 relative flex items-center justify-center min-w-[120px] min-h-[40px]">
						{loading.create ? <Spinner /> : "Create Room"}
					</Button>
					<Button onClick={handleJoin} disabled={loading.join} className="bg-gray-800 text-white hover:bg-blue-500 relative flex items-center justify-center min-w-[120px] min-h-[40px]">
					{loading.join ? <Spinner /> : "Join Room"}
					</Button>
				</CardFooter>
			</Card>
		</div>
  	);
}
