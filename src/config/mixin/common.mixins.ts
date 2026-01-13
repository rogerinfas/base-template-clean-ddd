// Mixins comunes para entidades y utilidades

import { Logger } from '@nestjs/common';

export class Loggable {
    log(message: string): void {
        // Puedes personalizar el logger aquí
        console.log(`[LOG] ${message}`);
    }

    logBaseObject(baseObject: object): void {
        Logger.log('Logging base object properties:', baseObject);
        // Loguea las propiedades del objeto base
        console.log(`[LOG] Base Object: ${JSON.stringify(baseObject, null, 2)}`);
    }
}

export class Timestamped {
    createdAt: Date = new Date();
    updatedAt: Date = new Date();

    touch(): void {
        this.updatedAt = new Date();
    }
}

export class SoftDeletable {
    deletedAt?: Date;

    softDelete(): void {
        this.deletedAt = new Date();
    }

    isDeleted(): boolean {
        return !!this.deletedAt;
    }
}

export class Identifiable {
    id: string = Math.random().toString(36).substring(2, 12);
}

// Puedes combinar estos mixins usando ManyMixinG
// Ejemplo:
// const Entity = ManyMixinG(BaseClass, Loggable, Timestamped, SoftDeletable, Identifiable);
// const obj = new Entity();
// obj.log('Hola mundo');
// obj.touch();
// obj.softDelete();
// console.log(obj.isDeleted());
// console.log(obj.id);
