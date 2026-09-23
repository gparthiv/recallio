export interface SynaSource {
  contentId: string;
  title: string;
  url: string | null;
  contentType: string;
}

export interface SynaMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SynaSource[];
  foundInSynapse?: boolean;
  offerInternetSearch?: boolean;
}

export interface SynaChatResponse {
  success: boolean;
  answer: string;
  sources: SynaSource[];
  foundInSynapse: boolean;
  offerInternetSearch: boolean;
}