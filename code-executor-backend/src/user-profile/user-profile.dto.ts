
import { IsOptional,IsString } from "class-validator";

export class UpdateUserProfileDto {

    @IsOptional()
    @IsString()
    profilePicture:string;

    @IsOptional()
    @IsString()
    firstName:string

    @IsOptional()
    @IsString()
    lastName:string

    @IsOptional()
    @IsString()
    phoneNumber:string;

    @IsOptional()
    @IsString()
    city:string;

    @IsOptional()
    @IsString()
    state:string;

    @IsOptional()
    @IsString()
    country:string;


    @IsOptional()
    @IsString()
    postcode:string




}