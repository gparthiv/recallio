import { Schema, model, Types } from "mongoose";


// USER MODEL
const userSchema = new Schema({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shareEnabled: { type: Boolean, default: false },
  shareLink: { type: String, unique: true, sparse: true },
}, { timestamps: true });

export const User = model('User', userSchema);

// LINK MODEL
const urlSchema = new Schema({
  hash: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Url = model('Url', urlSchema);

// CONTENT MODEL
const contentTypes = [
  "note",
  "youtube",
  "tweet",
  "instagram",
  "facebook",
  "github",
  "reddit",
  "amazon",
  "flipkart",
  "googleDrive",
  "linkedin",
  "medium",
  "wikipedia",
  "openai",
  "claude",
  "gemini",
  "link",
];

const contentSchema = new Schema({
  link: {
    type: String,
    default: null,
  },

  type: {
    type: String,
    enum: contentTypes,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  body: {
    type: Schema.Types.Mixed,
    default: null,
  },

  tags: [
    {
      type: Schema.Types.ObjectId,
      ref: "Tag",
    }
  ],

  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: async function (value: any) {
      const user = await User.findById(value);

      if (!user) {
        throw new Error("User doesnt exist");
      }
    }
  },

  shareEnabled: {
    type: Boolean,
    default: false,
  },

  shareLink: {
    type: String,
    unique: true,
    sparse: true,
  },

}, { timestamps: true });

export const Content = model('Content', contentSchema);

// TAG MODEL
const tagSchema = new Schema({
  title: { type: String, required: true, unique: true }
})

export const Tag = model('Tag', tagSchema);