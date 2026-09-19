import api from "./axios";

export async function shareBrain(share: boolean) {
  const response = await api.post("/v1/brain/share", {
    share,
  });

  return response.data;
}

export async function getSharedBrain(shareLink: string) {
  const response = await api.get(`/v1/brain/${shareLink}`);

  return response.data;
}