import { AgeCategories } from '@/api/resolvers/competence/competence.resolver.ts';

export const useAgeGroups = [
  {value: AgeCategories.EARLY_PRESCHOOL, label: "4-5 лет"},
  {value: AgeCategories.PRESCHOOL, label: "6-7 лет"},
  {value: AgeCategories.EARLY_SCHOOL, label: "7-8 лет"},
  {value: AgeCategories.SCHOOL, label: "9-11 лет"},
  {value: AgeCategories.HIGH_SCHOOL, label: "12-13 лет"},
]