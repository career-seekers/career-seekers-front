export interface EventServiceStatistics {
  platformsCount: number | null,
  verifiedPlatformsCount: number | null,
  directionsCount: number | null,
  directionsWithoutDocs: number | null,
  directionDocsCount: number | null,
  lastDocumentUpload: Date | null,
}