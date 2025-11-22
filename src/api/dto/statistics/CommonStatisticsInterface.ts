import type {EventServiceStatistics} from "@/api/dto/statistics/EventServiceStatistics.ts";
import type {UsersServiceStatistics} from "@/api/dto/statistics/UsersServiceStatistics.ts";

export interface CommonStatisticsInterface extends EventServiceStatistics, UsersServiceStatistics {}