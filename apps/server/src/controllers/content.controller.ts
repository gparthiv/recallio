import { Content } from "../models/Schemas.js";
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

    const { type, link, title, body} = result.data;

    // Check if link or note
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


    // Create content
    const content = await Content.create({
      type,
      link: type === "note" ? null : link!,
      title,
      body: type === "note" ? body! : null,
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
    // Get authenticated user's ID
    const userId = req.userId;

    // Find all content belonging to this user
    const content = await Content.find({ userId })
      .populate("title")
      .sort({ createdAt: -1 });

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

// UPDATE CONTENT
export async function updateContent(
  req: any,
  res: any
): Promise<any> {
  try {
    // 1. Get authenticated user's ID
    const userId = req.userId;

    // 2. Get content ID from URL
    const { contentId } = req.params;

    // 3. Validate request body
    const result = ContentSchema.safeParse({
      ...req.body,
      type: req.body.type,
    });

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid content",
        errors: result.error.issues[0]?.message,
      });
    }

    const { title, link, body } = result.data;

    // 4. Find existing content
    const content = await Content.findById(contentId);

    if (!content) {
      return res.status(404).json({
        message: "Content not found",
      });
    }

    // 5. Check ownership
    if (content.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message:
          "You do not have permission to edit this content",
      });
    }

    // 6. Validate link/note requirements
    if (content.type === "note" && !body) {
      return res.status(400).json({
        message: "Note body is required",
      });
    }

    if (content.type !== "note" && !link) {
      return res.status(400).json({
        message: "Link is required",
      });
    }

    // 9. Update content
    content.title = title;

    if (content.type === "note") {
      content.link = null;
      content.body = body!;
    } else {
      content.link = link!;
      content.body = null;
    }

    await content.save();

    // 10. Populate before returning
    await content.populate("title");

    return res.status(200).json({
      message: "Content updated successfully",
      content,
    });
  } catch (err: any) {
    console.error("Update content error:", err.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// DELETE CONTENT
export async function deleteContent(
  req: any,
  res: any
): Promise<any> {
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
    if (
      content.userId.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to delete this content",
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