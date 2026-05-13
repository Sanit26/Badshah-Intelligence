// Public API mixin for user settings (API key + voice language)
import Debug "mo:core/Debug";
import Map "mo:core/Map";
import Types "../types/chat";
import CommonTypes "../types/common";

mixin (userSettings : Map.Map<CommonTypes.UserId, Types.UserSettings>) {

  /// Store the caller's OpenRouter API key.
  public shared ({ caller }) func saveApiKey(apiKey : Text) : async () {
    Debug.todo();
  };

  /// Retrieve the caller's OpenRouter API key.
  public shared query ({ caller }) func getApiKey() : async ?Text {
    Debug.todo();
  };

  /// Store the caller's voice language preference ("en-US" or "hi-IN").
  public shared ({ caller }) func saveVoiceLanguage(lang : Text) : async () {
    Debug.todo();
  };

  /// Retrieve the caller's voice language preference.
  public shared query ({ caller }) func getVoiceLanguage() : async ?Text {
    Debug.todo();
  };
};
