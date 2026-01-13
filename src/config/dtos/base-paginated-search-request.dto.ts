import { IdDocumentTypeEnum } from '@domain/types/id-document-types.type';
import { ApiProperty } from '@nestjs/swagger';
import { TransformStringToArray } from '@presentation/decorators';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { BasePaginatedRequestDto, BasePaginatedRequestDtoLegacy } from './base-paginated-request.dto';

export class BasePaginatedSearchRequestDto extends BasePaginatedRequestDto {
    @ApiProperty({
        description: 'Search query string',
        example: 'John Doe',
        required: false,
    })
    @IsOptional()
    declare search?: string;

    @ApiProperty({
        description: 'Search by Id',
        required: false,
        type: String,
    })
    @IsOptional()
    @IsString()
    @IsUUID()
    id?: string;

    @ApiProperty({
        description: 'Search by Ids',
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsString({ each: true })
    ids?: string[];
}

export class BasePaginatedSearchRequestDtoLegacy extends BasePaginatedRequestDtoLegacy {
    @ApiProperty({
        description: 'Search query string',
        example: 'John Doe',
        required: false,
    })
    @IsOptional()
    declare search?: string;

    @ApiProperty({
        description: 'Search by Id',
        required: false,
        type: String,
    })
    @IsOptional()
    @IsString()
    @IsUUID()
    id?: string;

    @ApiProperty({
        description: 'Search by Ids',
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsString({ each: true })
    ids?: string[];

    @ApiProperty({
        description: 'Preselected Ids',
        required: false,
        type: [String],
    })
    @IsOptional()
    @TransformStringToArray()
    @IsArray({
        message: 'Los IDs preseleccionados deben ser un array',
    })
    @IsUUID('4', { each: true })
    preselectedIds?: string[];

    @ApiProperty({
        description: 'Filter by Id Document Type',
        required: false,
        enum: IdDocumentTypeEnum,
    })
    @IsOptional()
    @IsEnum(IdDocumentTypeEnum)
    idDocumentType?: IdDocumentTypeEnum;
}
