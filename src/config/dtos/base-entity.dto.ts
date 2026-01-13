import { BaseComposedEntityType, BaseEntityType } from '@config/entities/base-entities/base-entity.types';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsOptional, IsUUID } from 'class-validator';
export class BaseComposedEntityDto implements BaseComposedEntityType {
    @ApiProperty({
        description: 'Indicates if the entity is active',
        example: true,
    })
    @IsBoolean()
    isActive! boolean;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    @IsDate()
    createdAt! Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    @IsDate()
    updatedAt! Date;

    @ApiProperty({
        description: 'Deletion timestamp (soft delete)',
        example: '2024-01-01T00:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDate()
    deletedAt?!: Date;

    constructor(dto: Partial<BaseComposedEntityDto>) {
        Object.assign(this, dto);
    }
}

export class BaseEntityDto extends BaseComposedEntityDto implements BaseEntityType {
    @ApiProperty({
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    id! string;

    constructor(dto: Partial<BaseEntityDto>) {
        super(dto);
        Object.assign(this, dto);
    }
}
