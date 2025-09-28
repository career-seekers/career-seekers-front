export interface ChildUpdateInputDto {
  id: number;
  lastName: string | null;
  firstName: string | null;
  patronymic: string | null;
  dateOfBirth: string | null;
  mentorId: number | null;
}