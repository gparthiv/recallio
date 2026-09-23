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

    console.log("\n==============================");
    console.log("SYNAPSE CAPTURE");
    console.log("==============================");
    console.log("URL:", url);
    console.log("Page title:", pageTitle);
    console.log("Requested type:", type);
    console.log(
      "Selected text length:",
      selectedText?.length || 0
    );
    console.log(
      "Selected HTML length:",
      selectedHtml?.length || 0
    );

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

    console.log(
      "Final content type:",
      contentType
    );

    let body = null;

    /*
     * Selected text is always saved as a Note.
     */
    if (contentType === "note") {
      /*
       * First try AI formatting.
       */
      if (
        selectedHtml?.trim() ||
        selectedText?.trim()
      ) {
        console.log("\n--- AI FORMAT ---");
        console.log(
          "AI service:",
          AI_SERVICE_URL
        );

        console.log(
          "HTML preview:",
          selectedHtml.slice(0, 500)
        );

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
                html: selectedHtml || "",
                page_title: pageTitle || "",
                source_url: url,
              }),
            }
          );

          console.log(
            "AI format status:",
            aiResponse.status
          );

          const responseText =
            await aiResponse.text();

          console.log(
            "AI format response preview:",
            responseText.slice(0, 1000)
          );

          if (aiResponse.ok) {
            try {
              const aiData =
                JSON.parse(responseText);

              if (
                aiData?.document &&
                aiData.document.type === "doc"
              ) {
                body = aiData.document;

                console.log(
                  "AI formatting successful"
                );

                console.log(
                  "AI document:",
                  JSON.stringify(
                    body,
                    null,
                    2
                  ).slice(0, 3000)
                );
              } else {
                console.error(
                  "AI formatting returned invalid document"
                );
              }
            } catch (error) {
              console.error(
                "Could not parse AI format response:",
                error
              );
            }
          } else {
            console.error(
              "AI formatting failed:",
              responseText
            );
          }
        } catch (error) {
          console.error(
            "AI formatting unavailable:",
            error
          );
        }
      } else {
        console.log(
          "No selected HTML available; skipping AI formatting"
        );
      }

      /*
       * Fallback 1:
       * Deterministic HTML → Tiptap converter.
       */
      if (!body && selectedHtml?.trim()) {
        console.log(
          "Using HTML formatting fallback"
        );

        body = htmlToTiptap(selectedHtml);

        console.log(
          "HTML fallback document:",
          JSON.stringify(
            body,
            null,
            2
          ).slice(0, 3000)
        );
      }

      /*
       * Fallback 2:
       * Plain text → Tiptap paragraph.
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

    /*
     * AI title generation.
     */
    let generatedTitle: string | null = null;

    console.log("\n--- AI AUTOFILL ---");

    try {
      const autofillText = [
        selectedText?.trim(),
        pageTitle?.trim()
          ? `Page title: ${pageTitle.trim()}`
          : "",
        url
          ? `Source URL: ${url}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      console.log(
        "AI service:",
        AI_SERVICE_URL
      );

      console.log(
        "Text sent to AI:",
        autofillText.slice(0, 3000)
      );

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

      console.log(
        "AI autofill status:",
        aiResponse.status
      );

      const responseText =
        await aiResponse.text();

      console.log(
        "AI autofill response:",
        responseText.slice(0, 1000)
      );

      if (aiResponse.ok) {
        try {
          const aiData =
            JSON.parse(responseText);

          if (
            typeof aiData.title === "string" &&
            aiData.title.trim()
          ) {
            generatedTitle =
              aiData.title.trim();

            console.log(
              "AI title generated:",
              generatedTitle
            );
          } else {
            console.error(
              "AI autofill returned no valid title"
            );
          }
        } catch (error) {
          console.error(
            "Could not parse AI autofill response:",
            error
          );
        }
      } else {
        console.error(
          "AI autofill failed:",
          responseText
        );
      }
    } catch (error) {
      console.error(
        "AI autofill unavailable:",
        error
      );
    }

    /*
     * Final fallback title.
     */
    const finalTitle =
      generatedTitle ||
      pageTitle?.trim() ||
      url;

    console.log(
      "\nFinal title:",
      finalTitle
    );

    /*
     * Save to MongoDB.
     */
    const content = await Content.create({
      userId: req.userId,
      type: contentType,
      link: url,
      title: finalTitle,
      body,
    });

    console.log(
      "Content saved:",
      content._id
    );

    console.log("==============================\n");

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