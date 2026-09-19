import { User, Content } from "../models/Schemas.js";
import { shareBrainSchema } from "../validations/brain.validation.js";
import crypto from "crypto";

export async function shareBrain(req: any, res: any): Promise<any> {
  try {
    // get userid
    const userId = req.userId;
    // get share request true or false
    const result = shareBrainSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid share input",
        errors: result.error.issues[0]?.message
      });
    }

    // if all good then extract input
    const { share } = result.data;
    // extract userid
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // disable sharing in schema if input is false
    if (!share) {
      user.shareEnabled = false;
      await user.save();
      return res.status(200).json({ message: "Brain shraing disabled" });
    }

    // generate sharing link if one isnt there
    if (!user.shareLink) {
      user.shareLink = crypto.randomBytes(16).toString("hex");
    }

    user.shareEnabled = true;

    await user.save();

    return res.status(200).json({
      link: user.shareLink,
    });

  } catch (err: any) {
    console.error("Share brain error:", err.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getSharedBrain(req: any, res: any): Promise<any> {
  try {
    const { shareLink } = req.params;

    const user = await User.findOne({
      shareLink,
      shareEnabled: true,
    });

    if (!user) {
      return res.status(404).json({
        message: "No shared brain found",
      });
    }

    const content = await Content.find({
      userId: user._id,
    })
      .populate("tags", "title")
      .sort({ createdAt: -1 });

    const formattedContent = content.map((item: any) => ({
      id: item._id,
      type: item.type,
      link: item.link,
      title: item.title,
      body: item.type === "note" ? item.body : null,
      tags: item.tags.map((tag: any) => tag.title),
    }));

    return res.status(200).json({
      username: user.username,
      content: formattedContent,
    });

  } catch (err: any) {
    console.error("Get shared brain error:", err.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}