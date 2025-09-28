import type { ChildDocumentsOutputDto } from '@/api/resolvers/childDocuments/dto/output/child-documents-output.dto.ts';

export interface ChildOutputDto {
  id: number;
  lastName: string;
  firstName: string;
  patronymic: string;
  dateOfBirth: string;
  childDocuments: ChildDocumentsOutputDto;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    patronymic: string;
    dateOfBirth: string;
    email: string;
    mobileNumber: string;
    role: string;
    avatarId: number;
    verified: boolean;
    isMentor: boolean;
    tutorId: boolean;
    telegramLink: string | null;
  } | null;
  mentor: {
    id: number;
    firstName: string;
    lastName: string;
    patronymic: string;
    dateOfBirth: string;
    email: string;
    mobileNumber: string;
    role: string;
    avatarId: number;
    verified: boolean;
    isMentor: boolean;
    tutorId: boolean;
    telegramLink: string | null;
  } | null;
}