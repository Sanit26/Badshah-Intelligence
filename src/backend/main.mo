// Badshah Intelligence — composition root
import Map "mo:core/Map";
import Types "types/chat";
import CommonTypes "types/common";
import SettingsApi "mixins/settings-api";
import ChatApi "mixins/chat-api";
import DataApi "mixins/data-api";
import DataLib "lib/data";

actor {
  // Per-user settings store (API key + voice language)
  let userSettings = Map.empty<CommonTypes.UserId, Types.UserSettings>();

  // Per-user data upload and dashboard state
  let userDataMap = DataLib.initDataStore();

  include SettingsApi(userSettings);
  include ChatApi();
  include DataApi(userDataMap);
};
