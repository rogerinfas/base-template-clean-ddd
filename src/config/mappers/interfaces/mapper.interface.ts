import { BaseComposedIdEntity as BlackListEntity } from '@config/entities/base-entities/blacklist-strategy/base.entity';
import { BaseComposedIdEntity as WhiteListEntity } from '@config/entities/base-entities/whitelist-strategy/base.entity';

//Se debe usar un Partial<getpayload> en el metodo toPrisma para enviar un objeto plano procesble al repositorio

export interface IMapperBlackList<GenericDomainEntity extends BlackListEntity = BlackListEntity> {
    toPrisma<DomainEntity extends BlackListEntity = GenericDomainEntity, PrismaModelType = unknown>(
        entity: DomainEntity,
    ): PrismaModelType;
    toDomain<PrismaGetPayloadModelType = unknown, DomainEntity extends BlackListEntity = GenericDomainEntity>(
        prismaObject: PrismaGetPayloadModelType,
    ): DomainEntity;
}

export interface IMapperWhiteList<GenericDomainEntity extends WhiteListEntity = WhiteListEntity> {
    toPrisma<DomainEntity extends WhiteListEntity = GenericDomainEntity, PrismaModelType = unknown>(
        entity: DomainEntity,
    ): PrismaModelType;
    toDomain<PrismaGetPayloadModelType = unknown, DomainEntity extends WhiteListEntity = GenericDomainEntity>(
        prismaObject: PrismaGetPayloadModelType,
    ): DomainEntity;
}
