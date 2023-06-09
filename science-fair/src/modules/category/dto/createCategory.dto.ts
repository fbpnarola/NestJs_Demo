import { IsNotEmpty } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty()
    name: String;

    @IsNotEmpty()
    description: String;
}