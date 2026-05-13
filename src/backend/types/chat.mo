// Chat domain types for Badshah Intelligence AI
module {
  // A single message in a chat conversation
  public type ChatMessage = {
    role : Text;    // "user", "assistant", or "system"
    content : Text;
  };

  // User settings stored per principal
  public type UserSettings = {
    var apiKey : ?Text;           // OpenRouter API key
    var voiceLanguage : ?Text;    // "en-US" or "hi-IN"
  };
};
