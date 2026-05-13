// Domain logic for data upload and dashboard persistence
import Array "mo:core/Array";
import Map "mo:core/Map";
import DataTypes "../types/data";
import CommonTypes "../types/common";

module {
  public type DataStore = Map.Map<CommonTypes.UserId, DataTypes.UserDataState>;

  /// Create an empty DataStore.
  public func initDataStore() : DataStore {
    Map.empty<CommonTypes.UserId, DataTypes.UserDataState>();
  };

  /// Save (or replace) a FileMetadata record for the given user.
  public func saveFileMetadata(
    store    : DataStore,
    userId   : CommonTypes.UserId,
    metadata : DataTypes.FileMetadata
  ) : () {
    switch (store.get(userId)) {
      case (?state) {
        // Filter out any existing entry with the same fileId, then append new
        let filtered = state.files.filter(func(f) = f.fileId != metadata.fileId);
        state.files := filtered.concat<DataTypes.FileMetadata>([metadata]);
      };
      case null {
        let newState : DataTypes.UserDataState = {
          var latestFileId = null;
          var files        = [metadata];
          var dashboards   = [];
        };
        store.add(userId, newState);
      };
    };
  };

  /// Retrieve a single FileMetadata by fileId for the given user.
  public func getFileMetadata(
    store  : DataStore,
    userId : CommonTypes.UserId,
    fileId : Text
  ) : ?DataTypes.FileMetadata {
    switch (store.get(userId)) {
      case (?state) {
        state.files.find<DataTypes.FileMetadata>(func(f) = f.fileId == fileId);
      };
      case null { null };
    };
  };

  /// Return all uploaded file metadata for the given user.
  public func getUserFiles(
    store  : DataStore,
    userId : CommonTypes.UserId
  ) : [DataTypes.FileMetadata] {
    switch (store.get(userId)) {
      case (?state) { state.files };
      case null { [] };
    };
  };

  /// Save (or replace) a DashboardConfig for the given user + fileId.
  public func saveDashboardConfig(
    store  : DataStore,
    userId : CommonTypes.UserId,
    config : DataTypes.DashboardConfig
  ) : () {
    switch (store.get(userId)) {
      case (?state) {
        let existing = state.dashboards;
        let filtered = existing.filter(func((fid, _)) = fid != config.fileId);
        state.dashboards := filtered.concat<(Text, DataTypes.DashboardConfig)>([(config.fileId, config)]);
      };
      case null {
        let state : DataTypes.UserDataState = {
          var latestFileId = ?config.fileId;
          var files        = [];
          var dashboards   = [(config.fileId, config)];
        };
        store.add(userId, state);
      };
    };
  };

  /// Retrieve a DashboardConfig by fileId for the given user.
  public func getDashboardConfig(
    store  : DataStore,
    userId : CommonTypes.UserId,
    fileId : Text
  ) : ?DataTypes.DashboardConfig {
    switch (store.get(userId)) {
      case (?state) {
        switch (state.dashboards.find<(Text, DataTypes.DashboardConfig)>(func((fid, _)) = fid == fileId)) {
          case (?(_, cfg)) { ?cfg };
          case null { null };
        };
      };
      case null { null };
    };
  };

  /// Return the most-recently-generated dashboard for the given user.
  public func getLatestDashboard(
    store  : DataStore,
    userId : CommonTypes.UserId
  ) : ?DataTypes.DashboardConfig {
    switch (store.get(userId)) {
      case (?state) {
        switch (state.latestFileId) {
          case (?fid) {
            switch (state.dashboards.find<(Text, DataTypes.DashboardConfig)>(func((id, _)) = id == fid)) {
              case (?(_, cfg)) { ?cfg };
              case null { null };
            };
          };
          case null { null };
        };
      };
      case null { null };
    };
  };

  /// Mark a file as the currently active file for the user.
  public func setLatestFileId(
    store  : DataStore,
    userId : CommonTypes.UserId,
    fileId : Text
  ) : () {
    switch (store.get(userId)) {
      case (?state) {
        state.latestFileId := ?fileId;
      };
      case null {
        let state : DataTypes.UserDataState = {
          var latestFileId = ?fileId;
          var files        = [];
          var dashboards   = [];
        };
        store.add(userId, state);
      };
    };
  };

  /// Return the currently active fileId for the user.
  public func getLatestFileId(
    store  : DataStore,
    userId : CommonTypes.UserId
  ) : ?Text {
    switch (store.get(userId)) {
      case (?state) { state.latestFileId };
      case null { null };
    };
  };
};
