export type ContentType =
  | "note"
  | "youtube"
  | "tweet"
  | "instagram"
  | "facebook"
  | "github"
  | "reddit"
  | "amazon"
  | "flipkart"
  | "googleDrive"
  | "linkedin"
  | "medium"
  | "wikipedia"
  | "openai"
  | "claude"
  | "gemini"
  | "link";

export function detectContentType(url: string): ContentType {
  try {
    const hostname = new URL(url).hostname
      .toLowerCase()
      .replace(/^www\./, "");

    // YouTube
    if (
      hostname === "youtube.com" ||
      hostname === "youtu.be"
    ) {
      return "youtube";
    }

    // X / Twitter
    if (
      hostname === "x.com" ||
      hostname === "twitter.com"
    ) {
      return "tweet";
    }

    // Instagram
    if (hostname === "instagram.com") {
      return "instagram";
    }

    // Facebook
    if (hostname === "facebook.com" ||
        hostname === "fb.com") {
      return "facebook";
    }

    // GitHub
    if (hostname === "github.com") {
      return "github";
    }

    // Reddit
    if (hostname === "reddit.com") {
      return "reddit";
    }

    // Amazon
    if (
      hostname === "amazon.com" ||
      hostname === "amazon.in" ||
      hostname.endsWith(".amazon.com") ||
      hostname.endsWith(".amazon.in")
    ) {
      return "amazon";
    }

    // Flipkart
    if (hostname === "flipkart.com") {
      return "flipkart";
    }

    // Google Drive
    if (
      hostname === "drive.google.com" ||
      hostname === "docs.google.com"
    ) {
      return "googleDrive";
    }

    // LinkedIn
    if (hostname === "linkedin.com") {
      return "linkedin";
    }

    // Medium
    if (
      hostname === "medium.com" ||
      hostname.endsWith(".medium.com")
    ) {
      return "medium";
    }

    // Wikipedia
    if (
      hostname === "wikipedia.org" ||
      hostname.endsWith(".wikipedia.org")
    ) {
      return "wikipedia";
    }

    // OpenAI
    if (
      hostname === "openai.com" ||
      hostname.endsWith(".openai.com")
    ) {
      return "openai";
    }

    // Claude
    if (
      hostname === "claude.ai" ||
      hostname.endsWith(".claude.ai")
    ) {
      return "claude";
    }

    // Gemini
    if (
      hostname === "gemini.google.com" ||
      hostname.endsWith(".gemini.google.com")
    ) {
      return "gemini";
    }

    // Anything else
    return "link";
  } catch {
    return "link";
  }
}