
export enum SupportedMessageTypes {
    AddChat = "ADD_CHAT",
    UpdateChat = "UPDATE_CHAT",
}

type MessagePayload = {
    roomId: string;
    message: string;
    name: string;
    upvotes: number;
    chatId: string
}

export type OutgoingMessage = {
    type: SupportedMessageTypes.AddChat,
    payload: MessagePayload
} | {
    type: SupportedMessageTypes.UpdateChat,
    payload: Partial<MessagePayload>
}