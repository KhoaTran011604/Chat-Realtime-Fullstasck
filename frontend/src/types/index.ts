export interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt?: string;
}

export interface Chat {
    _id: string;
    chatName: string;
    isGroupChat: boolean;
    users: User[];
    latestMessage?: Message;
    groupAdmin?: User;
    createdAt: string;
    updatedAt: string;
    unreadCount?: number;
}

export interface Message {
    _id: string;
    sender: User;
    content: string;
    chat: Chat | string;
    readBy: string[];
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    token: string;
}

export interface Notification {
    message: Message;
    chat: Chat;
}
