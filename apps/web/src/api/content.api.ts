import api from "./axios";
import type { ContentType } from "../config/contentStyles";

export type { ContentType };

export interface AddContentData {
  type: ContentType;
  link?: string;
  title: string;
  body?: Record<string, unknown>;
}

export interface UpdateContentData {
  type: ContentType;
  title: string;
  link?: string;
  body?: Record<string, unknown>;
}

export async function getContent() {
  const response = await api.get("/v1/content");

  return response.data;
}

export async function addContent(data: AddContentData) {
  const response = await api.post("/v1/content", data);

  return response.data;
}

export async function updateContent(
  contentId: string,
  data: UpdateContentData
) {
  const response = await api.put(
    `/v1/content/${contentId}`,
    data
  );

  return response.data;
}

export async function deleteContent(contentId: string) {
  const response = await api.delete("/v1/content", {
    data: {
      contentId,
    },
  });

  return response.data;
}