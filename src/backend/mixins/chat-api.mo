// Public API mixin for AI chat completions via OpenRouter
import Debug "mo:core/Debug";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Types "../types/chat";

mixin () {

  /// Transform callback required by the IC HTTP outcall mechanism.
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    Debug.todo();
  };

  /// Forward messages to OpenRouter and return the assistant's reply text.
  /// Callers supply their own apiKey so it never needs to be stored server-side for this call.
  public shared func sendChatMessage(
    messages : [Types.ChatMessage],
    apiKey : Text
  ) : async Text {
    Debug.todo();
  };
};
