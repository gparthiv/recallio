import { Content, Tag } from "../models/Schemas.js";
import { ContentSchema } from "../validations/content.validation.js";

export async function addContent(req: any, res: any): Promise<any> {
  try {
    // Get authenticated userID from middleware
    const userId = req.userId;
    const result = ContentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid content",
        errors: result.error.issues[0]?.message,
      });
    }

    const { type, link, title, body, tags } = result.data;

    // check if link or note
    if (type === "note" && !body) {
      return res.status(400).json({
        message: "Note body is required",
      });
    }

    if (type !== "note" && !link) {
      return res.status(400).json({
        message: "Link is required",
      });
    }

    // get the tags uniformed
    const normalizedTags = tags.map((tag) => tag.trim().toLowerCase());
    // Find existing tags or create new ones
    const tagId = await Promise.all(
      normalizedTags.map(async (t) => {
        let tag = await Tag.findOne({ title: t });
        if (!tag) {
          tag = await Tag.create({ title: t });
        }
        return tag._id;
      })
    );

    // Create content
    const content = await Content.create({
      type,
      link: type === "note" ? null : link!,
      title,
      body: type === "note" ? body! : null,
      tags: tagId,
      userId,
    });
    // Return created content
    return res.status(201).json({
      message: "Content added successfully",
      content,
    });
  } catch (err: any) {
    console.error("Add content error:", err.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// READ CONTENT
export async function getContent(req: any, res: any): Promise<any> {
  try {
    // 1. Get authenticated user's ID
    const userId = req.userId;

    // 2. Find all content belonging to this user
    const content = await Content.find({ userId })
      .populate("tags", "title")
      .sort({ createdAt: -1 });

    // 3. Return content
    return res.status(200).json({
      content,
    });
  } catch (err: any) {
    console.error("Get content error:", err.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}


export async function deleteContent(req: any, res: any): Promise<any> {
  try {
    // 1. Get authenticated user's ID
    const userId = req.userId;

    // 2. Get content ID from request body
    const { contentId } = req.body;

    // 3. Check whether the content exists
    const content = await Content.findById(contentId);

    if (!content) {
      return res.status(404).json({
        message: "Content not found",
      });
    }

    // 4. Check ownership
    if (content.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You do not have permission to delete this content",
      });
    }

    // 5. Delete content
    await Content.findByIdAndDelete(contentId);

    // 6. Return success
    return res.status(200).json({
      message: "Content deleted successfully",
    });
  } catch (err: any) {
    console.error("Delete content error:", err.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}