/* import { MessageEvent } from '@nestjs/common';
import { paths } from '@config/types/api';
import { paths as runtimePaths } from '../../../../generated/openapi-schema.json';
import { CustomMessageEvent } from '../sse.response.dto';
import { SSEData, SSEventsScope } from './sse-data.dto'; */

// Métodos HTTP válidos según OpenAPI
/* export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace'; */

// Tipo que representa todas las combinaciones válidas de path y método
/* export type PathWithMethod = {
    [K in keyof typeof runtimePaths]: keyof (typeof runtimePaths)[K] extends string
        ? `${K & string} - ${keyof (typeof runtimePaths)[K] & string}`
        : never;
}[keyof typeof runtimePaths]; */

// Tipo que genera todas las combinaciones válidas "path - method" en tiempo de compilación
/* export type PathWithMethodEnum = {
    [K in keyof typeof runtimePaths]: keyof (typeof runtimePaths)[K] extends string
        ? `${K & string}-${keyof (typeof runtimePaths)[K] & string}`
        : never;
}[keyof typeof runtimePaths]; */

/* export const pathEnum: Record<PathWithMethodEnum, string> = Object.entries(runtimePaths).reduce(
    (acc, [key, value]) => {
        if (key in ({} as paths)) {
            Object.keys(value).forEach((method) => {
                const customKey = `${key}-${method}` as PathWithMethodEnum;
                const valueStr = `${method}-${key}`;
                acc[customKey] = valueStr;
            });
        }
        return acc;
    },
    {} as Record<PathWithMethodEnum, string>,
);

export const pathEnumKeys: Record<PathWithMethodEnum, PathWithMethodEnum> = Object.keys(pathEnum).reduce(
    (acc, key) => {
        acc[key as PathWithMethodEnum] = key as PathWithMethodEnum;
        return acc;
    },
    {} as Record<PathWithMethodEnum, PathWithMethodEnum>,
);

export type PathsKeys = keyof paths;

export interface CustomMessageEventType<TType extends string = string, TData extends SSEData = SSEData>
    extends MessageEvent {
    data: TData;
    type: TType;
    id?: string;
    retry?: number;
}
export type QueryServerSentEvent<
    TEvent extends PathWithMethodEnum,
    TData extends SSEData = SSEData,
> = CustomMessageEvent<TEvent, TData>;

export type PathsQueryServerSentEvents<TData extends SSEData = SSEData> = {
    [key in PathWithMethodEnum]: QueryServerSentEvent<key, TData>;
};

const tempQueryServerSentEvents = {} as Record<PathWithMethodEnum, QueryServerSentEvent<PathWithMethodEnum, SSEData>>;

(Object.keys(runtimePaths) as Array<string>)
    .filter((key): key is PathWithMethodEnum => key in ({} as paths))
    .forEach((key) => {
        tempQueryServerSentEvents[key] = {
            type: key,
            data: new SSEData({
                message: 'New notification',
                scope: SSEventsScope.others,
            }),
        } as QueryServerSentEvent<typeof key, { message: 'New notification'; scope: SSEventsScope.others }>;
    });

export const queryServerSentEvents = tempQueryServerSentEvents as PathsQueryServerSentEvents<SSEData>;

export const pathsWithHttpMethods: Record<PathsKeys, { methods: string[] }> = Object.entries(runtimePaths).reduce(
    (acc, [key, value]) => {
        if (key in ({} as paths)) {
            const methods = Object.keys(value);
            acc[key as PathsKeys] = { methods };
        }
        return acc;
    },
    {} as Record<PathsKeys, { methods: string[] }>,
); */

// Array constante de valores válidos para PathWithMethodEnum
/* export const PATH_WITH_METHOD_ENUM_VALUES: string[] = Object.keys(pathEnumKeys); */
