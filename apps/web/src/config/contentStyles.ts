import youtubeIcon from "../assets/youtube.svg";
import xIcon from "../assets/x.svg";
import instagramIcon from "../assets/Instagram.webp";
import facebookIcon from "../assets/facebook.webp";
import githubIcon from "../assets/github.svg";
import redditIcon from "../assets/reddit.svg";
import amazonIcon from "../assets/amazon.svg";
import flipkartIcon from "../assets/flipkart.svg";
import googleDriveIcon from "../assets/GoogleDrive.webp";
import linkedinIcon from "../assets/linkedin.svg";
import mediumIcon from "../assets/Medium.svg";
import wikipediaIcon from "../assets/Wikipedia.webp";
import openaiIcon from "../assets/openai.svg";
import claudeIcon from "../assets/claude.svg";
import geminiIcon from "../assets/gemini.svg";
import linkIcon from "../assets/link.svg";
import noteIcon from "../assets/note.svg";

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

interface ContentStyle {
  label: string;
  icon: string;
  background: string;
  text: string;
  muted: string;
}

export const contentStyles: Record<
  ContentType,
  ContentStyle
> = {
  note: {
    label: "Note",
    icon: noteIcon,
    background: "bg-[#F4EDC9]",
    text: "text-[#3D371F]",
    muted: "text-[#3D371F]/60",
  },

  youtube: {
    label: "YouTube",
    icon: youtubeIcon,
    background: "bg-[#FFE5E9]",
    text: "text-[#3D1118]",
    muted: "text-[#3D1118]/60",
  },

  tweet: {
    label: "X",
    icon: xIcon,
    background: "bg-[#E9E8E8]",
    text: "text-[#171717]",
    muted: "text-[#171717]/60",
  },

  instagram: {
    label: "Instagram",
    icon: instagramIcon,
    background: "bg-[#F7E4EC]",
    text: "text-[#3D1829]",
    muted: "text-[#3D1829]/60",
  },

  facebook: {
    label: "Facebook",
    icon: facebookIcon,
    background: "bg-[#E6EEF8]",
    text: "text-[#172A45]",
    muted: "text-[#172A45]/60",
  },

  github: {
    label: "GitHub",
    icon: githubIcon,
    background: "bg-[#EAEAEA]",
    text: "text-[#181818]",
    muted: "text-[#181818]/60",
  },

  reddit: {
    label: "Reddit",
    icon: redditIcon,
    background: "bg-[#FBE9DF]",
    text: "text-[#432318]",
    muted: "text-[#432318]/60",
  },

  amazon: {
    label: "Amazon",
    icon: amazonIcon,
    background: "bg-[#F8EBD8]",
    text: "text-[#3F2B18]",
    muted: "text-[#3F2B18]/60",
  },

  flipkart: {
    label: "Flipkart",
    icon: flipkartIcon,
    background: "bg-[#E7EFF8]",
    text: "text-[#182B42]",
    muted: "text-[#182B42]/60",
  },

  googleDrive: {
    label: "Google Drive",
    icon: googleDriveIcon,
    background: "bg-[#EAF3E7]",
    text: "text-[#263A24]",
    muted: "text-[#263A24]/60",
  },

  linkedin: {
    label: "LinkedIn",
    icon: linkedinIcon,
    background: "bg-[#E5EFF7]",
    text: "text-[#19344A]",
    muted: "text-[#19344A]/60",
  },

  medium: {
    label: "Medium",
    icon: mediumIcon,
    background: "bg-[#EAEAEA]",
    text: "text-[#202020]",
    muted: "text-[#202020]/60",
  },

  wikipedia: {
    label: "Wikipedia",
    icon: wikipediaIcon,
    background: "bg-[#EEEEEB]",
    text: "text-[#292929]",
    muted: "text-[#292929]/60",
  },

  openai: {
    label: "OpenAI",
    icon: openaiIcon,
    background: "bg-[#E6F0EC]",
    text: "text-[#19352A]",
    muted: "text-[#19352A]/60",
  },

  claude: {
    label: "Claude",
    icon: claudeIcon,
    background: "bg-[#F3E8DC]",
    text: "text-[#432E20]",
    muted: "text-[#432E20]/60",
  },

  gemini: {
    label: "Gemini",
    icon: geminiIcon,
    background: "bg-[#E9ECF8]",
    text: "text-[#27304A]",
    muted: "text-[#27304A]/60",
  },

  link: {
    label: "Link",
    icon: linkIcon,
    background: "bg-[#EEE6F5]",
    text: "text-[#34223F]",
    muted: "text-[#34223F]/60",
  },
};