import {defineStore} from "pinia";
import type {CommonStatisticsInterface} from "@/api/dto/statistics/CommonStatisticsInterface.ts";
import type {EventServiceStatistics} from "@/api/dto/statistics/EventServiceStatistics.ts";

export const statisticsStore = defineStore("statistics", {
  state: (): CommonStatisticsInterface => ({
    platformsCount: null,
    verifiedPlatformsCount: null,
    directionsCount: null,
    directionsWithoutDocs: null,
    directionDocsCount: null,
    lastDocumentUpload: null,
  }),
  getters: {
    getPlatformsCount: (state: CommonStatisticsInterface) => state.platformsCount,
    getVerifiedPlatformsCount: (state: CommonStatisticsInterface) => state.platformsCount,
    getDirectionsCount: (state: CommonStatisticsInterface) => state.directionsCount,
    getDirectionsWithoutDocs: (state: CommonStatisticsInterface) => state.directionsWithoutDocs,
    getDirectionDocsCount: (state: CommonStatisticsInterface) => state.directionDocsCount,
    getLastDocumentUpload: (state: CommonStatisticsInterface) => state.lastDocumentUpload,
  },
  actions: {
    updateEventsServiceStatistics(value: EventServiceStatistics) {
      this.platformsCount = value.platformsCount;
      this.verifiedPlatformsCount = value.verifiedPlatformsCount;
      this.directionsCount = value.directionsCount;
      this.directionsWithoutDocs = value.directionsWithoutDocs
      this.directionDocsCount = value.directionDocsCount;
      this.lastDocumentUpload = value.lastDocumentUpload;
    }
  }
})