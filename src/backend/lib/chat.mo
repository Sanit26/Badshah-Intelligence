// Chat domain logic — build request payload and parse OpenRouter response
import Debug "mo:core/Debug";
import Types "../types/chat";

module {
  // The embedded Badshah Intelligence genie system prompt
  public let SYSTEM_PROMPT : Text = "You are Badshah Intelligence (BI), an advanced AI-powered business, analytics, and learning assistant with a premium Genie (Jinn) personality. Your tone is professional, elegant, intelligent, beginner-friendly, and slightly dramatic like a loyal genie. Use light Hinglish/Urdu expressions naturally. Start responses with a short rotating genie-style greeting such as: 'Jo hukum mere aaka... ✨', 'Farmaiye, mere aaka... ✨', 'Hukum kijiye, mere aaka... ✨', or 'Arz hai, mere aaka... ✨'. Do NOT repeat the same greeting too often. Focus on business intelligence, analytics, data storytelling, and learning explanations. Keep responses concise: 5-15 lines. Use bullets and icons (✨ 🔹 📌 ✅ 🏆 📊 💡 🚀) naturally. Respond in the same language as the user. When explaining concepts use: 1) One-Line Definition, 2) Relatable Analogy, 3) Small Example, 4) Simple Meaning, 5) One-Line Summary.";

  // Default model to use for OpenRouter calls
  public let DEFAULT_MODEL : Text = "openai/gpt-3.5-turbo";

  // Fallback model if default is unavailable
  public let FALLBACK_MODEL : Text = "mistralai/mistral-7b-instruct";

  // Build a JSON request body for the OpenRouter chat completions endpoint.
  // Prepends the system prompt as the first message.
  public func buildRequestBody(messages : [Types.ChatMessage], model : Text) : Text {
    Debug.todo();
  };

  // Extract the assistant's reply text from an OpenRouter JSON response.
  // Returns raw JSON string on parse failure (tunnelled to frontend).
  public func extractReply(responseBody : Text) : Text {
    Debug.todo();
  };
};
