import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ReactivateManyDto {
    @ApiProperty({
        description: 'Array of entity IDs to reactivate',
        type: [String],
        example: ['5f8d0d55b54764421b71e301', '5f8d0d55b54764421b71e302'],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    ids!: string[];
}
