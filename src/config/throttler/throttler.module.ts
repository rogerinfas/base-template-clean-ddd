import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from './throttler.guard';
import { ThrottlerService } from './throttler.service';
import { THROTTLER_SERVICE } from './throttler.service.interface';

@Module({
    imports: [ConfigModule],
    providers: [
        ThrottlerService,
        {
            provide: THROTTLER_SERVICE,
            useClass: ThrottlerService,
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
    exports: [ThrottlerService],
})
export class ThrottlerModule {}
