import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type SSEDataType = {
    message: string;
    scope: SSEventsScope;
    userId?: string;
    internalEventName?: string;
    referenceId?: string;
    referenceCode?: string;
};

export enum SSEventsScope {
    all = 'all',
    others = 'others',
    self = 'self',
}

export class SSEData implements SSEDataType {
    @ApiProperty({ description: 'The message sent via SSE', example: 'Hello, world!' })
    message: string;

    @ApiPropertyOptional({ description: 'The user ID associated with the SSE message', example: 'user123' })
    userId?: string;

    @ApiProperty({
        description: 'The scope of the SSE message (all, others, self)',
        example: SSEventsScope.others,
        enum: SSEventsScope,
        enumName: 'SSEventsScope',
    })
    scope: SSEventsScope;

    @ApiPropertyOptional({
        description:
            'Internal event name for tracking purposes, in the front could be use for extra actions according to the event type which is being sent. Use with caution, as it is a generic string.',
        example: 'purchase_request_created',
    })
    internalEventName?: string;

    @ApiPropertyOptional({
        description:
            'Reference ID for the event, useful for tracking specific events, in case in the frontend the user should go into a dynamic page',
        example: 'ref123',
    })
    referenceId?: string;

    @ApiPropertyOptional({
        description: 'Additional data related to the event, can be any JSON object',
        example: 'SAL-9F5FF977',
    })
    referenceCode?: string;

    constructor(params: SSEData) {
        Object.assign(this, params);
    }
}
