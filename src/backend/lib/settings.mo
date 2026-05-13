// Settings domain logic — per-user API key and voice language
import Debug "mo:core/Debug";
import Map "mo:core/Map";
import Types "../types/chat";
import CommonTypes "../types/common";

module {
  public type UserSettingsMap = Map.Map<CommonTypes.UserId, Types.UserSettings>;

  // Store the API key for a user, creating settings record if needed
  public func saveApiKey(
    settings : UserSettingsMap,
    caller : CommonTypes.UserId,
    apiKey : Text
  ) : () {
    Debug.todo();
  };

  // Retrieve the API key for a user
  public func getApiKey(
    settings : UserSettingsMap,
    caller : CommonTypes.UserId
  ) : ?Text {
    Debug.todo();
  };

  // Store the voice language preference for a user
  public func saveVoiceLanguage(
    settings : UserSettingsMap,
    caller : CommonTypes.UserId,
    lang : Text
  ) : () {
    Debug.todo();
  };

  // Retrieve the voice language preference for a user
  public func getVoiceLanguage(
    settings : UserSettingsMap,
    caller : CommonTypes.UserId
  ) : ?Text {
    Debug.todo();
  };
};
