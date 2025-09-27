export interface ChildOutputDto {
  id: number,
  lastName: string,
  firstName: string,
  patronymic: string,
  dateOfBirth: string,
  mentor: {
    id: number,
    firstName: string,
    lastName: string,
    patronymic: string,
    dateOfBirth: string,
    email: string,
    mobileNumber: string,
    role: string,
    avatarId: number,
    verified: boolean,
    isMentor: boolean,
    tutorId: boolean,
    telegramLink: string | null
  } | null
}