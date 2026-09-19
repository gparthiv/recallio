import type { CaptureData } from "./types.js";
import { detectContentType } from "./utils/detectContentType.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-synapse",
    title: "Save to Synapse",
    contexts: ["selection", "link", "page"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const url = info.linkUrl || info.pageUrl || "";

  if (!url) {
    console.error("No URL found");
    return;
  }

  let selectedText = info.selectionText;
  let selectedHtml = "";

  /*
   * If text was selected, ask the webpage for the
   * original HTML structure of that selection.
   */
  if (selectedText?.trim() && tab?.id) {
    try {
      const selection = await chrome.tabs.sendMessage(
        tab.id,
        {
          type: "GET_SELECTION_HTML",
        }
      );

      selectedText = selection?.text || selectedText;
      selectedHtml = selection?.html || "";

      console.log("Selected HTML:", selectedHtml);
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

  console.log("Capture:", capture);

  const hasSelectedText = Boolean(
    selectedText?.trim()
  );

  /*
   * Selected text is always a Note.
   * Otherwise detect the content type from the URL.
   */
  const type = hasSelectedText
    ? "note"
    : detectContentType(url);

  console.log("Detected content type:", type);

  const { token } =
    await chrome.storage.local.get("token");

  if (!token) {
    console.error("No Synapse token found");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/v1/capture",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url,
          selectedText,
          selectedHtml,
          pageTitle: tab?.title,
          type,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Capture failed:", data);
      return;
    }

    console.log("Saved to Synapse:", data);
  } catch (error) {
    console.error("Network error:", error);
  }
});