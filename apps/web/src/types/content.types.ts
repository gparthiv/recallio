export type ContentType =
  | "document"
  | "tweet"
  | "youtube"
  | "link"
  | "note";

export type ContentFilter = "all" | ContentType;

export interface ContentTag {
  _id: string;
  title: string;
}

export interface Content {
  _id: string;
  type: ContentType;
  title: string;
  link: string | null;
  body: Record<string, any> | null;
  tags: ContentTag[];
  shareEnabled: boolean;
  shareLink?: string;
  createdAt: string;
  updatedAt: string;
}