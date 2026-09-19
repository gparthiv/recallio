import type { Request, Response } from "express";
import { Content } from "../models/Schemas.js";
import { htmlToTiptap } from "../utils/htmlToTiptap.js";

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
] as const;

export const captureContent = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      url,
      selectedText,
      selectedHtml,
      pageTitle,
      type,
    } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "URL is required",
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const contentType = contentTypes.includes(type)
      ? type
      : "link";

    let body = null;

    /*
     * Selected text is saved as a Note.
     *
     * If HTML is available, preserve the original
     * webpage formatting and convert it to Tiptap JSON.
     *
     * If HTML is unavailable, fall back to plain text.
     */
    if (contentType === "note") {
      if (selectedHtml?.trim()) {
        body = htmlToTiptap(selectedHtml);
      } else if (selectedText?.trim()) {
        body = {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: selectedText.trim(),
                },
              ],
            },
          ],
        };
      }
    }

    const content = await Content.create({
      userId: req.userId,
      type: contentType,
      link: url,
      title: pageTitle || url,
      body,
    });

    return res.status(201).json({
      message: "Saved to Synapse",
      content,
    });
  } catch (error) {
    console.error("Capture error:", error);

    return res.status(500).json({
      message: "Failed to save capture",
    });
  }
};