/* import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PATH_WITH_METHOD_ENUM_VALUES } from "./types/path-with-method-enum-values";
import type {
	CustomMessageEventType,
	PathWithMethodEnum,
} from "./types/sse.types";
import { pathEnum, pathEnumKeys } from "./types/sse.types";
import type { SSEData } from "./types/sse-data.dto"; */

/* export class CustomMessageEvent<
	TType extends string = string,
	TData extends SSEData = SSEData,
> implements CustomMessageEventType<TType, TData>
{
	@ApiProperty({ type: String })
	type: TType;
	data: TData;
	@ApiPropertyOptional({
		description: "Optional event ID for SSE.",
		type: String,
	})
	id?: string;

	@ApiPropertyOptional({
		description: "Optional retry interval in milliseconds for SSE.",
		type: Number,
	})
	retry?: number;

	constructor({
		data,
		type,
		id,
		retry,
	}: CustomMessageEventType<TType, TData>) {
		this.data = data;
		this.type = type;
		this.id = id;
		this.retry = retry;
	}
}

export class CustomMessageEventWithPaths
	extends CustomMessageEvent<PathWithMethodEnum>
	implements CustomMessageEventType<PathWithMethodEnum, SSEData>
{
	@ApiProperty({
		description: "Data payload for the SSE event.",
	})
	declare data: SSEData;

	@ApiProperty({
		description: "Type of the SSE event, restricted to PathWithMethodEnum.",
		enum: PATH_WITH_METHOD_ENUM_VALUES,
		enumName: "PathWithMethodEnum",
	})
	declare type: PathWithMethodEnum;
	constructor({
		type,
		id,
		retry,
		data,
	}: CustomMessageEventType<PathWithMethodEnum, SSEData>) {
		super({
			data,
			type,
			id,
			retry,
		});
	}
} */

/**
 * Un evento de notificación sin paths
 */
/* export class NotificationMessageEvent
	extends CustomMessageEvent<"message">
	implements CustomMessageEventType<"message", SSEData>
{
	private constructor({
		id,
		retry,
		data,
	}: {
		id?: string;
		retry?: number;
		data: SSEData;
	}) {
		super({
			data,
			type: "message",
			id,
			retry,
		});
	} */

/**
 * Convierte un evento con paths a un evento de notificación sin paths.
 * El tipo se establece en 'message'. Utilizado para enviar notificaciones genéricas.
 */
/* 	static fromCustomMessageEvent(
		event: CustomMessageEvent
	): NotificationMessageEvent {
		return new NotificationMessageEvent({
			data: event.data,
			id: event.id,
			retry: event.retry,
		});
	}
} */
