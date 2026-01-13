import { ApiProperty } from '@nestjs/swagger';
import { TransformStringToArray } from '@presentation/decorators/transform.decorator';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

/**
 * DTO compartido para operaciones en bulk que requieren un array de IDs.
 * Puede recibir un string único, múltiples strings separados por coma, o un array.
 */
export class BulkIdsDto {
    @ApiProperty({
        description: 'Array de IDs. Puede ser un string único, múltiples strings separados por coma, o un array.',
        type: [String],
        example: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
    })
    @TransformStringToArray()
    @IsArray()
    @ArrayNotEmpty({ message: 'El array de IDs no puede estar vacío' })
    @IsUUID('all', { each: true, message: 'Cada ID debe ser un UUID válido' })
    ids: string[];
}
