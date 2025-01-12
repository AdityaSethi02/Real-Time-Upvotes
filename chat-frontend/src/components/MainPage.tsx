'use client';

import { ChevronUp } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const userId = Math.floor(Math.random() * 1000);

type Chat = {
	message: string;
	votes: number;
    chatId: string
};

interface roomData {
    chatCoolDown: number;
    upvoteCoolDown: number;
    roomName: string;
}

export default function MainPage({ initialChats, upVotes1 = 3, upVotes2 = 10 }: { initialChats?: Chat[]; upVotes1?: number;	upVotes2?: number }) {
	const [chats, setChats] = useState(initialChats || []);
	const chatRef = useRef<HTMLInputElement>(null);
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isCoolDown, setIsCoolDown] = useState(false);
	const [coolDownTime, setCoolDownTime] = useState(0);
	const [upvoteCooldowns, setUpvoteCooldowns] = useState<{ [key: string]: number }>({});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [copy, setCopy] = useState(false);
    const [roomData, setRoomData] = useState<roomData | null>(null);

    const { roomId } = useParams();

    const copyFunction = () => {
        const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId;

        if (roomIdString) {
            navigator.clipboard.writeText(roomIdString);
        }
        setCopy(true);
        setTimeout(() => setCopy(false), 3000);
    }

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

	const addChat = () => {
		if (chatRef.current && !isCoolDown) {
			const chat = chatRef.current.value;
			if (!chat) {
				return;
			}

			sendChat(chat);
			chatRef.current.value = '';

			initiateCoolDown();
		}
	};

	function initiateCoolDown() {
		setIsCoolDown(true);
		setCoolDownTime(roomData?.chatCoolDown || 0);
	}

	function initiateUpvoteCooldown(chatId: string) {
		setUpvoteCooldowns((prev) => ({ ...prev, [chatId]: roomData?.upvoteCoolDown || 0 }));
	}

    function dismissChat(chatId: string) {
        setChats((chats) => chats.filter(chat => chat.chatId !== chatId));
    }

    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                if (roomId) {
                    const response = await axios.get(`/api/room`, {
                        params: { roomId: roomId }
                    });
                    setRoomData(response.data as roomData);
                    console.log(response.data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchRoomData();
    }, [roomId]);

	useEffect(() => {
		if (isCoolDown) {
			const interval = setInterval(() => {
				setCoolDownTime((time) => {
					if (time <= 1) {
						setIsCoolDown(false);
						clearInterval(interval);
						return 0;
					}
					return time - 1;
				});
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [isCoolDown]);

	useEffect(() => {
		const interval = setInterval(() => {
			setUpvoteCooldowns((prev) => {
				const updatedCooldowns = { ...prev };
				Object.keys(updatedCooldowns).forEach((id) => {
					if (updatedCooldowns[id] <= 1) {
						delete updatedCooldowns[id];
					} else {
						updatedCooldowns[id] -= 1;
					}
				});
				return updatedCooldowns;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, []);

    function sendUpvote(chatId: string) {
		if (!upvoteCooldowns[chatId]) {
			socket?.send(
				JSON.stringify({
					type: 'UPVOTE_MESSAGE',
					payload: {
						chatId,
						userId: userId,
						roomId: roomId,
					},
				})
			);
			initiateUpvoteCooldown(chatId);
		}
	}

    function sendChat(message: string) {
        socket?.send(JSON.stringify({
            type: "SEND_MESSAGE",
            payload: {
                message: message,
                userId: userId,
                roomId: roomId
            }
        }));
    }

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080/");
        setSocket(ws);

        ws.onopen = function () {
            console.log("websocket is now open")
            ws.send(JSON.stringify({
                type: "JOIN_ROOM",
                payload: {
                    name: "aditya",
                    userId: userId,
                    roomId: roomId
                }
            }));
        };

        ws.onmessage = function (event) {
            try {
                const {payload, type} = JSON.parse(event.data);

                if (type === "ADD_CHAT") {
                    setChats(chats => [...chats, { message: payload.message, votes: payload.upVotes, chatId: payload.chatId }]);
                }

                if (type === "UPDATE_CHAT") {
                    setChats(chats => chats.map(c => {
                        if (c.chatId == payload.chatId) {
                            return {
                                ...c,
                                votes: payload.upVotes
                            }
                        }
                        return c;
                    }))
                }
            } catch (error) {
                console.error(error)
            }
        };

        return () => {
            ws.close();
        }

    }, [roomId]);

    useEffect(() => {
        chats.forEach((chat) => {
            if (chat.votes >= upVotes2) {
                alert(chat.message);
            }
        });
    }, [upVotes2, chats]);

	return (
		<div className="bg-gray-800 border border-gray-700 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-2 space-y-4">
            <div className="flex items-center pt-2 justify-between">
                <div className="flex-1" />
                <div className="text-center flex-1 text-xl font-bold text-white">CHATS</div>
                <div className="flex-1 flex justify-end">
                    <button onClick={openModal} className="bg-gray-800 hover:bg-blue-500 px-2 py-1 rounded text-white">
                        Room Details
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-black text-white p-5 rounded shadow-lg max-w-lg w-full">
                        <h2 className="flex justify-center text-xl font-semibold mb-4">Room Details</h2>
                        <p>
                            <div>Room Name: {roomData?.roomName}</div>
                            <div className="flex items-center space-x-2">
                                <span className="w-20">Room Id: </span><span>{roomId}</span>
                                <button
                                    onClick={copyFunction}
                                    className="bg-gray-800 hover:bg-blue-500 px-2 py-1 rounded text-sm"
                                >
                                    {copy ? "Copied!" : "Copy"}
                                </button>
                            </div>
                            <div>Chat Cooldown: {roomData?.chatCoolDown}</div>
                            <div>Upvote Cooldown: {roomData?.upvoteCoolDown}</div>
                        </p>
                        <div className="flex justify-center mt-4">
                            <button onClick={closeModal} className="bg-gray-800 hover:bg-red-500 text-white px-3 py-1 rounded">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

			<div className="flex border min-w-[900px] rounded-md">
				{/* All Chat */}
				<div className="text-center border-r w-full">
					<h1 className="p-2 text-white">All Chats</h1>
					<div className="border">
						<div className="flex flex-col max-h-96 overflow-auto min-h-96">
							{chats.map((chat) => (
								<div className="flex flex-col gap-1 px-2 py-1" key={chat.chatId}>
									<div className="text-sm w-full text-left text-white">{chat.message}</div>
									<div className="flex gap-1 justify-between">
										<div className="text-xs text-gray-400">
											Upvotes: {chat.votes}
										</div>
										<div className="flex gap-2">
										<button
                                            className={`text-xs text-gray-400 ${upvoteCooldowns[chat.chatId] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => {
                                                const newChats = [...chats];
                                                const chatIndex = chats.findIndex((c) => c.chatId === chat.chatId);
                                                if (chatIndex > -1) {
                                                    newChats[chatIndex].votes++;
                                                    setChats(newChats);
                                                    sendUpvote(chat.chatId);
                                                }
                                            }}
                                            disabled={!!upvoteCooldowns[chat.chatId]}
                                        >
                                            <ChevronUp />
                                            {upvoteCooldowns[chat.chatId] && <span className="text-red-500"> ({upvoteCooldowns[chat.chatId]}s)</span>}
                                        </button>
										</div>
									</div>
								</div>
							))}
						</div>
						<div className="flex gap-2 p-2 border-t">
							<input
								type="text"
								className="bg-transparent text-white w-full"
								placeholder="Chat"
								ref={chatRef}
							/>
							<button
                                className={`w-full flex items-center justify-center px-5 py-2 text-sm transition-colors duration-200 rounded-lg gap-x-2 sm:w-auto ${
                                    isCoolDown
                                        ? "bg-gray-400 text-gray-700"
                                        : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
                                }`}
                                onClick={addChat}
                                disabled={isCoolDown}
                            >
                                {isCoolDown ? `${coolDownTime}s` : "Send"}
                            </button>
						</div>
					</div>
				</div>
				{/* Medium Upvotes */}
				<div className="text-center border-r w-full">
					<h1 className="p-2 text-white">Medium Priority Chats</h1>
					<div className="border-t">
						<div className="flex flex-col max-h-96 overflow-auto">
							{chats
								.filter(
									(chat) => chat.votes >= upVotes1 && chat.votes < upVotes2
								)
								.map((chat) => (
									<div className="flex flex-col gap-1 p-2" key={chat.chatId}>
										<div className="text-sm w-full text-left text-white">
											{chat.message}
										</div>
										<div className="flex gap-1 justify-between">
											<div className="text-xs text-gray-400">
												Upvotes: {chat.votes}
											</div>
											<div className="flex gap-2">
                                                <button
                                                    className={`text-xs text-gray-400 ${upvoteCooldowns[chat.chatId] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => {
                                                        const newChats = [...chats];
                                                        const chatIndex = chats.findIndex((c) => c.chatId === chat.chatId);
                                                        if (chatIndex > -1) {
                                                            newChats[chatIndex].votes++;
                                                            setChats(newChats);
                                                            sendUpvote(chat.chatId);
                                                        }
                                                    }}
                                                    disabled={!!upvoteCooldowns[chat.chatId]}
                                                >
                                                    <ChevronUp />
                                                    {upvoteCooldowns[chat.chatId] && <span className="text-red-500"> ({upvoteCooldowns[chat.chatId]}s)</span>}
                                                </button>
											</div>
										</div>
									</div>
								))}
						</div>
					</div>
				</div>
				{/* High Upvotes */}
				<div className="text-center border-r w-full">
					<h1 className="p-2 text-white">High Priority Chats</h1>
					<div className="border-t">
						<div className="flex flex-col max-h-96 overflow-auto">
							{chats
								.filter((chat) => chat.votes >= upVotes2)
								.map((chat) => (
									<div className="flex flex-col gap-1 p-2" key={chat.chatId}>
										<div className="text-sm w-full text-left text-white">
											{chat.message}
										</div>
										<div className="flex gap-1 justify-between">
											<div className="text-xs text-gray-400">
												Upvotes: {chat.votes}
											</div>
											<div className="flex gap-2">
                                                <button onClick={() => dismissChat(chat.chatId)} className="text-xs text-red-700">
                                                    Dismiss
                                                </button>
                                                <button
                                                    className={`text-xs text-gray-400 ${upvoteCooldowns[chat.chatId] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => {
                                                        const newChats = [...chats];
                                                        const chatIndex = chats.findIndex((c) => c.chatId === chat.chatId);
                                                        if (chatIndex > -1) {
                                                            newChats[chatIndex].votes++;
                                                            setChats(newChats);
                                                            sendUpvote(chat.chatId);
                                                        }
                                                    }}
                                                    disabled={!!upvoteCooldowns[chat.chatId]}
                                                >
                                                    <ChevronUp />
                                                    {upvoteCooldowns[chat.chatId] && <span className="text-red-500"> ({upvoteCooldowns[chat.chatId]}s)</span>}
                                                </button>
											</div>
										</div>
									</div>
								))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}