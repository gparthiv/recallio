import crypto from "crypto";
import { Content } from "../models/Schemas.js";

export async function shareNote(req: any, res: any): Promise<any> {
  try {
    const userId = req.userId;
    const { contentId } = req.params;
    const { share } = req.body;

    if (typeof share !== "boolean") {
      return res.status(400).json({
        message: "share must be a boolean",
      });
    }

    const note = await Content.findOne({
      _id: contentId,
      userId,
      type: "note",
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (!share) {
      note.shareEnabled = false;

      await note.save();

      return res.status(200).json({
        message: "Note sharing disabled",
      });
    }

    if (!note.shareLink) {
      note.shareLink = crypto.randomBytes(16).toString("hex");
    }

    note.shareEnabled = true;

    await note.save();

    return res.status(200).json({
      link: note.shareLink,
    });

  } catch (err: any) {
    console.error("Share note error:", err.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getSharedNote(
  req: any,
  res: any
): Promise<any> {
  try {
    const { shareLink } = req.params;

    const note = await Content.findOne({
      shareLink,
      shareEnabled: true,
      type: "note",
    })
      .populate("title")
      .populate("userId", "username");

    if (!note) {
      return res.status(404).json({
        message: "Shared note not found",
      });
    }

    const formattedNote = {
      id: note._id,
      username: (note.userId as any).username,
      type: note.type,
      title: note.title,
      body: note.body,
    };

    return res.status(200).json(formattedNote);

  } catch (err: any) {
    console.error("Get shared note error:", err.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}