import type { backendInterface } from "../backend";

export const mockBackend: backendInterface = {
  getApiKey: async () => null,
  getVoiceLanguage: async () => "en-US",
  saveApiKey: async (_apiKey: string) => undefined,
  saveVoiceLanguage: async (_lang: string) => undefined,
  sendChatMessage: async (_messages, _apiKey) =>
    "Jo hukum mere aaka… ✨ Aapka sawaal bahut acha hai! Here is a thoughtful response from Badshah Intelligence. Ask. Analyze. Act.",
  transform: async (input) => ({
    status: BigInt(200),
    body: input.response.body,
    headers: input.response.headers,
  }),
  getDashboardConfig: async (_fileId) => null,
  getFileMetadata: async (_fileId) => null,
  getLatestDashboard: async () => null,
  getLatestFileId: async () => null,
  getUserFiles: async () => [],
  saveDashboardConfig: async (_config) => undefined,
  saveFileMetadata: async (_metadata) => undefined,
  setLatestFileId: async (_fileId) => undefined,
};
