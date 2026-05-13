// Data upload and dashboard types for Badshah Intelligence

module {
  /// Metadata for an uploaded file (CSV or PDF).
  public type FileMetadata = {
    fileId      : Text;
    fileName    : Text;
    fileType    : Text;           // "csv" | "pdf"
    uploadedAt  : Int;
    rowCount    : Nat;
    columnNames : [Text];
    dataPreview : Text;           // JSON string of first 5 rows
  };

  /// Statistical summary for a single column.
  public type ColumnStat = {
    columnName   : Text;
    dataType     : Text;          // "number" | "text" | "date"
    min          : ?Text;
    max          : ?Text;
    avg          : ?Text;
    uniqueValues : ?[Text];
  };

  /// A single KPI card configuration.
  public type KpiConfig = {
    title  : Text;
    value  : Text;
    change : Text;
    trend  : Text;                // "up" | "down" | "neutral"
  };

  /// A single chart configuration.
  public type ChartConfig = {
    chartType : Text;             // "line" | "bar" | "area" | "pie"
    title     : Text;
    xKey      : Text;
    yKeys     : [Text];
    data      : Text;             // JSON string
  };

  /// Full dashboard configuration generated from an uploaded file.
  public type DashboardConfig = {
    fileId      : Text;
    kpis        : [KpiConfig];
    chartConfigs: [ChartConfig];
    aiInsights  : [Text];
    generatedAt : Int;
  };

  /// Per-user data state stored in the backend.
  public type UserDataState = {
    var latestFileId : ?Text;
    var files        : [FileMetadata];
    var dashboards   : [(Text, DashboardConfig)];  // (fileId, DashboardConfig)
  };
};
