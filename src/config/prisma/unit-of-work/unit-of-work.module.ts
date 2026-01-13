import { Module } from '@nestjs/common';
import { UNIT_OF_WORK } from '@config/interfaces/unit-of-work.interface';
import { PrismaModule } from '../prisma.module';
import { PrismaUnitOfWorkService } from './prisma-unit-of-work.service';

@Module({
    imports: [PrismaModule],
    providers: [
        {
            provide: UNIT_OF_WORK,
            useClass: PrismaUnitOfWorkService,
        },
    ],
    exports: [UNIT_OF_WORK],
})
export class UnitOfWorkModule {}
