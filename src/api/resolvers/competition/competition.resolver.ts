import ApiResolver from "@/utils/ApiResolver";
import {CompetitionInputDto} from "@/api/resolvers/competition/dto/input/competition-input.dto";
import {CompetitionOutputDto} from "@/api/resolvers/competition/dto/output/competition-output.dto";
import {CommonOutputDto} from "@/api/dto/common-output.dto";

export enum AgeCategories {
    EARLY_PRESCHOOL = "PRESCHOOL_1",
    PRESCHOOL = "PRESCHOOL_2",
    EARLY_SCHOOL = "SCHOOL_1",
    SCHOOL = "SCHOOL_2",
    HIGH_SCHOOL = "SCHOOL_3",
}

export class CompetitionResolver {
    private apiResolver = new ApiResolver("events-service/v1/directions")
    private token = localStorage.getItem('access_token')

    public async create(data: CompetitionInputDto) {
        return await this
            .apiResolver
            .request<CompetitionInputDto, CommonOutputDto<CompetitionOutputDto | string>>(
                "",
                "POST",
                data,
                this.token ? this.token : undefined
            )
    }

    public async getAll() {
        return await this
            .apiResolver
            .request<null, CommonOutputDto<CompetitionOutputDto[] | string>>(
                "",
                "GET",
                null,
                this.token ? this.token : undefined
            )
    }

    public async getByAgeCategory(category: AgeCategories) {
        return await this
            .apiResolver
            .request<null, CommonOutputDto<CompetitionOutputDto[] | string>>(
                `getByAgeCategory/${category}`,
                "GET",
                null,
                this.token ? this.token : undefined
            )
    }

    public async getByUserId(id: number) {
        return await this
            .apiResolver
            .request<null, CommonOutputDto<CompetitionOutputDto[] | string>>(
                `getByUserId/${id}`,
                "GET",
                null,
                this.token ? this.token : undefined
            )
    }

    public async getByExpertId(id: number) {
        return await this
            .apiResolver
            .request<null, CommonOutputDto<CompetitionOutputDto[] | string>>(
                `getByExpertId/${id}`,
                "GET",
                null,
                this.token ? this.token : undefined
            )
    }
}