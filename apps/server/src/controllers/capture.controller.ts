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

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  "http://localhost:8000";

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
     * Selected text is always saved as a Note.
     */
    if (contentType === "note") {
      /*
       * First try AI formatting.
       */
      if (selectedHtml?.trim()) {
        try {
          const aiResponse = await fetch(
            `${AI_SERVICE_URL}/format`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text: selectedText || "",
                html: selectedHtml,
                page_title: pageTitle || "",
                source_url: url,
              }),
            }
          );

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();

            body = aiData.document;

            console.log(
              "AI formatting successful"
            );
          } else {
            console.error(
              "AI formatting failed:",
              await aiResponse.text()
            );
          }
        } catch (error) {
          console.error(
            "AI service unavailable:",
            error
          );
        }
      }

      /*
       * Fallback 1:
       * Use our deterministic HTML → Tiptap converter.
       */
      if (!body && selectedHtml?.trim()) {
        console.log(
          "Using HTML formatting fallback"
        );

        body = htmlToTiptap(selectedHtml);
      }

      /*
       * Fallback 2:
       * Save plain text as a Tiptap paragraph.
       */
      if (!body && selectedText?.trim()) {
        console.log(
          "Using plain text fallback"
        );

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

    let generatedTitle: string | null = null;

    try {
      const autofillText =
        selectedText?.trim() ||
        pageTitle?.trim() ||
        url;

      const aiResponse = await fetch(
        `${AI_SERVICE_URL}/autofill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: autofillText,
            page_title: pageTitle || "",
            source_url: url,
            content_type: contentType,
          }),
        }
      );

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();

        if (
          typeof aiData.title === "string" &&
          aiData.title.trim()
        ) {
          generatedTitle = aiData.title.trim();

          console.log(
            "AI title generated:",
            generatedTitle
          );
        }
      } else {
        console.error(
          "AI autofill failed:",
          await aiResponse.text()
        );
      }
    } catch (error) {
      console.error(
        "AI autofill unavailable:",
        error
      );
    }

    const content = await Content.create({
      userId: req.userId,
      type: contentType,
      link: url,
      title:
        generatedTitle ||
        pageTitle ||
        url,
      body,
    });

    return res.status(201).json({
      message: "Saved to Synapse",
      content,
    });
  } catch (error) {
    console.error(
      "Capture error:",
      error
    );

    return res.status(500).json({
      message: "Failed to save capture",
    });
  }
};