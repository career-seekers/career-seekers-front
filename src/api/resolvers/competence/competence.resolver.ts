import ApiResolver from "@/utils/ApiResolver";
import {CommonOutputDto} from "@/api/dto/common-output.dto";
import {CompetenceInputDto} from "@/api/resolvers/competence/dto/input/competence-input.dto";
import {CompetenceOutputDto} from "@/api/resolvers/competence/dto/output/competence-output.dto";

export enum AgeCategories {
    EARLY_PRESCHOOL = "PRESCHOOL_1",
    PRESCHOOL = "PRESCHOOL_2",
    EARLY_SCHOOL = "SCHOOL_1",
    SCHOOL = "SCHOOL_2",
    HIGH_SCHOOL = "SCHOOL_3",
}

export class CompetenceResolver {
    private apiResolver = new ApiResolver("events-service/v1/directions")
    private token = localStorage.getItem('access_token')

    public async create(data: CompetenceInputDto) {
        return await this
            .apiResolver
            .request<CompetenceInputDto, CommonOutputDto<CompetenceOutputDto | string>>(
                "",
                "POST",
                data,
                this.token ? this.token : undefined
            )
    }

    public async getAll() {
        return await this
            .apiResolver
            .request<null, CommonOutputDto<CompetenceOutputDto[] | string>>(
                "",
                "GET",
                null,
                this.token ? this.token : undefined
            )
    }

    public async getByAgeCategory(category: AgeCategories) {
        return await this
            .apiResolver
            .request<null, CommonOutputDto<CompetenceOutputDto[] | string>>(
                `getByAgeCategory/${category}`,
                "GET",
                null,
                this.token ? this.token : undefined
            )
    }

    public async getAllByUserId(id: number) {
        return await this
            .apiResolver
            .request<null, CommonOutputDto<CompetenceOutputDto[] | string>>(
                `getByUserId/${id}`,
                "GET",
                null,
                this.token ? this.token : undefined
            )
    }

    public async getAllByExpertId(id: number) {
        return await this
            .apiResolver
            .request<null, CommonOutputDto<CompetenceOutputDto[] | string>>(
                `getByExpertId/${id}`,
                "GET",
                null,
                this.token ? this.token : undefined
            )
    }

    public async update(data: CompetenceInputDto) {
        return await this
            .apiResolver
            .request<CompetenceInputDto, CommonOutputDto<string>>(
                "",
            "PATCH",
                data,
                this.token ? this.token : undefined
            )
    }

    public async delete(id: number) {
        return await this
            .apiResolver
            .request<null, CommonOutputDto<string>>(
                `${id}`,
                "DELETE",
                null,
                this.token ? this.token : undefined
            )
    }
}