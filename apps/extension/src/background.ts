import type { CaptureData } from "./types.js";
import { detectContentType } from "./utils/detectContentType.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-synapse",
    title: "Save to Synapse",
    contexts: ["selection", "link", "page"],
  });
});

chrome.contextMenus.onClicked.addListener(
  async (info, tab) => {
    const url =
      info.linkUrl ||
      info.pageUrl ||
      "";

    if (!url) {
      console.error("No URL found");
      return;
    }

    let selectedText =
      info.selectionText || "";

    let selectedHtml = "";

    /*
     * If text was selected, directly execute code
     * inside the webpage to retrieve both the
     * selected text and its original HTML.
     */
    if (
      selectedText.trim() &&
      tab?.id
    ) {
      try {
        const results =
          await chrome.scripting.executeScript({
            target: {
              tabId: tab.id,
            },

            func: () => {
              const selection =
                window.getSelection();

              if (
                !selection ||
                selection.rangeCount === 0
              ) {
                return {
                  text: "",
                  html: "",
                };
              }

              const range =
                selection.getRangeAt(0);

              const container =
                document.createElement("div");

              container.appendChild(
                range.cloneContents()
              );

              return {
                text: selection.toString(),
                html: container.innerHTML,
              };
            },
          });

        const selection =
          results[0]?.result;

        if (selection) {
          selectedText =
            selection.text ||
            selectedText;

          selectedHtml =
            selection.html || "";
        }

        console.log(
          "Selected text:",
          selectedText
        );

        console.log(
          "Selected HTML:",
          selectedHtml
        );
      } catch (error) {
        console.error(
          "Could not retrieve selected HTML:",
          error
        );
      }
    }

    const capture: CaptureData = {
      url,
      selectedText,
      selectedHtml,
      pageTitle: tab?.title,
    };

    console.log(
      "Capture:",
      capture
    );

    /*
     * Selected text always becomes a note.
     * Otherwise detect the type from the URL.
     */
    const hasSelectedText =
      Boolean(selectedText.trim());

    const type = hasSelectedText
      ? "note"
      : detectContentType(url);

    console.log(
      "Detected content type:",
      type
    );

    /*
     * Get authentication token.
     */
    const { token } =
      await chrome.storage.local.get(
        "token"
      );

    if (!token) {
      console.error(
        "No Synapse token found"
      );
      return;
    }

    try {
      const response =
        await fetch(
          "http://localhost:5000/api/v1/capture",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              url,
              selectedText,
              selectedHtml,
              pageTitle:
                tab?.title,
              type,
            }),
          }
        );

      const responseText = await response.text();

      console.log(
        "Capture response status:",
        response.status
      );

      console.log(
        "Capture response:",
        responseText
      );

      if (!response.ok) {
        console.error(
          "Capture failed:",
          responseText
        );
        return;
      }

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error(
          "Backend returned non-JSON response:",
          responseText
        );
        return;
      }

      console.log(
        "Saved to Synapse:",
        data
      );

      
    } catch (error) {
      console.error(
        "Network error:",
        error
      );
    }
  }
);