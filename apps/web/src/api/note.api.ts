import api from "./axios";

export async function shareNote(
  contentId: string,
  share: boolean
) {
  const response = await api.post(
    `/v1/note/${contentId}/share`,
    {
      share,
    }
  );

  return response.data;
}

export async function getSharedNote(
  shareLink: string
) {
  const response = await api.get(
    `/v1/note/share/${shareLink}`
  );

  return response.data;
}