import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    content: string;
    chat: mongoose.Types.ObjectId;
    readBy: mongoose.Types.ObjectId[];
    imageUrl?: string;
    imagePublicId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            trim: true,
            required: false, // Not required if image is sent
        },
        chat: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        imageUrl: {
            type: String,
            required: false,
        },
        imagePublicId: {
            type: String,
            required: false,
        },
        readBy: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
