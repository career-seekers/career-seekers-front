import {defineStore} from "pinia";
import type {CommonStatisticsInterface} from "@/api/dto/statistics/CommonStatisticsInterface.ts";
import type {EventServiceStatistics} from "@/api/dto/statistics/EventServiceStatistics.ts";
import type {UsersServiceStatistics} from "@/api/dto/statistics/UsersServiceStatistics.ts";

export const statisticsStore = defineStore("statistics", {
  state: (): CommonStatisticsInterface => ({
    platformsCount: null,
    verifiedPlatformsCount: null,
    directionsCount: null,
    directionsWithoutDocs: null,
    directionDocsCount: null,
    lastDocumentUpload: null,

    tutorsInfo: null,
    expertsInfo: null,
    mentorsInfo: null,
    usersInfo: null,
    childrenCount: null,
  }),

  getters: {
    getPlatformsCount: (state: CommonStatisticsInterface) => state.platformsCount,
    getVerifiedPlatformsCount: (state: CommonStatisticsInterface) => state.platformsCount,
    getDirectionsCount: (state: CommonStatisticsInterface) => state.directionsCount,
    getDirectionsWithoutDocs: (state: CommonStatisticsInterface) => state.directionsWithoutDocs,
    getDirectionDocsCount: (state: CommonStatisticsInterface) => state.directionDocsCount,
    getLastDocumentUpload: (state: CommonStatisticsInterface) => state.lastDocumentUpload,

    getTutorsInfo: (state: CommonStatisticsInterface) => state.tutorsInfo,
    getExpertsInfo: (state: CommonStatisticsInterface) => state.expertsInfo,
    getMentorsInfo: (state: CommonStatisticsInterface) => state.mentorsInfo,
    getUsersInfo: (state: CommonStatisticsInterface) => state.usersInfo,
    getChildrenCount: (state: CommonStatisticsInterface) => state.childrenCount,
  },

  actions: {
    updateEventsServiceStatistics(value: EventServiceStatistics) {
      this.platformsCount = value.platformsCount;
      this.verifiedPlatformsCount = value.verifiedPlatformsCount;
      this.directionsCount = value.directionsCount;
      this.directionsWithoutDocs = value.directionsWithoutDocs
      this.directionDocsCount = value.directionDocsCount;
      this.lastDocumentUpload = value.lastDocumentUpload;
    },

    updateUsersServiceStatistics(value: UsersServiceStatistics) {
      this.tutorsInfo = value.tutorsInfo;
      this.expertsInfo = value.expertsInfo;
      this.mentorsInfo = value.mentorsInfo;
      this.usersInfo = value.usersInfo;
      this.childrenCount = value.childrenCount;
    }
  }
})