// Public API mixin for data upload and dashboard persistence
import DataLib "../lib/data";
import DataTypes "../types/data";
import CommonTypes "../types/common";

mixin (userDataMap : DataLib.DataStore) {

  /// Store file metadata for the calling user.
  public shared ({ caller }) func saveFileMetadata(
    metadata : DataTypes.FileMetadata
  ) : async () {
    DataLib.saveFileMetadata(userDataMap, caller, metadata);
  };

  /// Retrieve a single file's metadata by fileId for the calling user.
  public shared query ({ caller }) func getFileMetadata(
    fileId : Text
  ) : async ?DataTypes.FileMetadata {
    DataLib.getFileMetadata(userDataMap, caller, fileId);
  };

  /// List all uploaded file metadata for the calling user.
  public shared query ({ caller }) func getUserFiles() : async [DataTypes.FileMetadata] {
    DataLib.getUserFiles(userDataMap, caller);
  };

  /// Save a generated dashboard configuration for the calling user.
  public shared ({ caller }) func saveDashboardConfig(
    config : DataTypes.DashboardConfig
  ) : async () {
    DataLib.saveDashboardConfig(userDataMap, caller, config);
  };

  /// Retrieve the dashboard config for a specific fileId for the calling user.
  public shared query ({ caller }) func getDashboardConfig(
    fileId : Text
  ) : async ?DataTypes.DashboardConfig {
    DataLib.getDashboardConfig(userDataMap, caller, fileId);
  };

  /// Retrieve the most recently generated dashboard for the calling user.
  public shared query ({ caller }) func getLatestDashboard() : async ?DataTypes.DashboardConfig {
    DataLib.getLatestDashboard(userDataMap, caller);
  };

  /// Mark a fileId as the currently active file for the calling user.
  public shared ({ caller }) func setLatestFileId(fileId : Text) : async () {
    DataLib.setLatestFileId(userDataMap, caller, fileId);
  };

  /// Retrieve the currently active fileId for the calling user.
  public shared query ({ caller }) func getLatestFileId() : async ?Text {
    DataLib.getLatestFileId(userDataMap, caller);
  };
};
