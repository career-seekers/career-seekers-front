export interface UsersServiceStatistics {
  tutorsInfo: UsersStatisticPairDto | null,
  expertsInfo: UsersStatisticPairDto | null,
  mentorsInfo: UsersStatisticPairDto | null,
  usersInfo: UsersStatisticPairDto | null,
  childrenCount: number | null,
}

export interface UsersStatisticPairDto {
  count: number,
  verified: number,
}