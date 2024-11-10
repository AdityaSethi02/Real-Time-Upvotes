'use client';

import { ChevronUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const userId = Math.floor(Math.random() * 1000);
const roomId = sessionStorage.getItem("roomId");

if (!roomId) {
    window.location.href = "/user/join";
}

type Chat = {
	message: string;
	votes: number;
    chatId: string
};

export default function MainPage({
	initialChats,
	upVotes1 = 3,
	upVotes2 = 10,
}: {
	initialChats?: Chat[];
	upVotes1?: number;
	upVotes2?: number;
}) {
	const [chats, setChats] = useState(initialChats || []);
	const chatRef = useRef<HTMLInputElement>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isCoolDown, setIsCoolDown] = useState(false);
	const [coolDownTime, setCoolDownTime] = useState(0);
	const [isUpvoteCoolDown, setIsUpvoteCoolDown] = useState(false);
	const [upvoteCoolDownTime, setUpvoteCoolDownTime] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copy, setCopy] = useState(false);

    

    const copyFunction = () => {
		if (roomId) {
			navigator.clipboard.writeText(roomId);
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
		setCoolDownTime(30);
	}

	function initiateUpvoteCoolDown() {
		setIsUpvoteCoolDown(true);
		setUpvoteCoolDownTime(30);
	}

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
		if (isUpvoteCoolDown) {
			const interval = setInterval(() => {
				setUpvoteCoolDownTime((time) => {
					if (time <= 1) {
						setIsUpvoteCoolDown(false);
						clearInterval(interval);
						return 0;
					}
					return time - 1;
				});
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [isUpvoteCoolDown]);

    function sendUpvote(chatId: string) {
		if (!isUpvoteCoolDown) {
			socket?.send(JSON.stringify({
				type: "UPVOTE_MESSAGE",
				payload: {
					chatId,
					userId: userId,
					roomId: roomId
				}
			}));
			initiateUpvoteCoolDown();
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
        const ws = new WebSocket("wss://upvote-backend.onrender.com/");
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
        };

    }, [])
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
                    <div className="bg-black text-white p-5 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Details</h2>
                        <p>
                            <div>Room Name: Room Name</div>
                            <div className="flex items-center space-x-2">
                                <span>Room Id: {roomId}</span>
                                <button
                                    onClick={copyFunction}
                                    className="bg-gray-800 hover:bg-blue-500 px-2 py-1 rounded text-sm"
                                >
                                    {copy ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </p>
                        <button onClick={closeModal} className="mt-4 bg-gray-800 hover:bg-red-500 text-white px-3 py-1 rounded">
                            Close
                        </button>
                    </div>
                </div>
            )}

			<div className="flex border min-w-[900px] rounded-md">
				{/* All Chat */}
				<div className="text-center border-r w-full">
					<h1 className="p-2 text-white">All Chats</h1>
					<div className="border">
						<div className="flex flex-col max-h-96 overflow-auto min-h-96">
							{chats.map((chat, i) => (
								<div className="flex flex-col gap-1 px-2 py-1" key={chat.chatId}>
									<div className="text-sm w-full text-left text-white">{chat.message}</div>
									<div className="flex gap-1 justify-between">
										<div className="text-xs text-gray-400">
											Upvotes: {chat.votes}
										</div>
										<div className="flex gap-2">
										<button
												className={`text-xs text-gray-400 ${isUpvoteCoolDown ? 'opacity-50 cursor-not-allowed' : ''}`}
												onClick={() => {
													const newChats = [...chats];
													newChats[i].votes++;
													setChats(newChats);
													sendUpvote(chat.chatId);
												}}
												disabled={isUpvoteCoolDown}
											>
												<ChevronUp />
												{isUpvoteCoolDown && <span className="text-red-500"> ({upvoteCoolDownTime}s)</span>} {/* Optional timer display */}
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
								.map((chat, i) => (
									<div className="flex flex-col gap-1 p-2" key={i}>
										<div className="text-sm w-full text-left text-white">
											{chat.message}
										</div>
										<div className="flex gap-1 justify-between">
											<div className="text-xs text-gray-400">
												Upvotes: {chat.votes}
											</div>
											<div className="flex gap-2">
												<button
													className="text-xs text-gray-400"
													onClick={() => {
														const newChats = [...chats];
														newChats[i].votes++;
														setChats(newChats);
                                                        sendUpvote(chat.chatId);
													}}
												>
													<ChevronUp />
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
								.map((chat, i) => (
									<div className="flex flex-col gap-1 p-2" key={i}>
										<div className="text-sm w-full text-left text-white">
											{chat.message}
										</div>
										<div className="flex gap-1 justify-between">
											<div className="text-xs text-gray-400">
												Upvotes: {chat.votes}
											</div>
											<div className="flex gap-2">
												<button
													className="text-xs text-gray-400"
													onClick={() => {
														const newChats = [...chats];
														newChats[i].votes++;
														setChats(newChats);
                                                        sendUpvote(chat.chatId);
													}}
												>
													<ChevronUp />
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