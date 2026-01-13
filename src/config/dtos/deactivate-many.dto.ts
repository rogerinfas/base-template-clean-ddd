import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class DeactivateManyDto {
    @ApiProperty({
        description: 'Array of entity IDs to deactivate',
        type: [String],
        example: ['5f8d0d55b54764421b71e301', '5f8d0d55b54764421b71e302'],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    ids: string[];
}
