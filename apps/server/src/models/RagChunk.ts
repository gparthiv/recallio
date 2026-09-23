import mongoose, { Schema, Document } from "mongoose";

export interface IRagChunk extends Document {
  contentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  text: string;
  embedding: number[];

  chunkIndex: number;
  totalChunks: number;

  contentType: string;
  title: string;
  sourceUrl: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const ragChunkSchema = new Schema<IRagChunk>(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    totalChunks: {
      type: Number,
      required: true,
    },

    contentType: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    sourceUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const RagChunk = mongoose.model<IRagChunk>(
  "RagChunk",
  ragChunkSchema
);

export default RagChunk;