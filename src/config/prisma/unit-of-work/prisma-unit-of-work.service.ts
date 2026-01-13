/** biome-ignore-all lint/suspicious/noExplicitAny: migration */

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IUnitOfWork } from '@config/interfaces/unit-of-work.interface';
import { PrismaService } from '../prisma.service';

/**
 * Contexto de transacción global/ambient
 * Los repositorios automáticamente detectarán y usarán la transacción activa
 */
class TransactionContext {
    private static currentTransaction: any = null;

    static setTransaction(tx: any): void {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.currentTransaction = tx;
    }

    static getTransaction(): PrismaClient {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.currentTransaction;
    }

    static clearTransaction(): void {
        this.currentTransaction = null;
    }

    static isActive(): boolean {
        return this.currentTransaction !== null;
    }
}

/**
 * Implementación simple del Unit of Work para Prisma
 * Establece contexto ambient para que repositorios automáticamente usen la transacción
 */
@Injectable()
export class PrismaUnitOfWorkService implements IUnitOfWork {
    constructor(private readonly prismaService: PrismaService) {}

    async executeInTransaction<T>(fn: () => Promise<T>): Promise<T> {
        // Si ya hay una transacción activa, simplemente ejecutar la función
        if (TransactionContext.isActive()) {
            return await fn();
        }

        // Si no hay transacción activa, crear una nueva
        return this.prismaService.$transaction(
            async (prismaTransaction) => {
                // Establecer contexto ambient
                TransactionContext.setTransaction(prismaTransaction);

                try {
                    // Los casos de uso no saben de tx, solo ejecutan normalmente
                    const result = await fn();
                    return result;
                } finally {
                    // Limpiar contexto
                    TransactionContext.clearTransaction();
                }
            },
            {
                // TODO timeout
                timeout: 60000,
            },
        );
    }

    /**
     * Método para que repositorios obtengan el cliente correcto
     * Uso interno - no expuesto en la interfaz
     */
    static getCurrentClient(defaultPrisma: PrismaService): PrismaClient {
        return TransactionContext.getTransaction() || defaultPrisma;
    }
}
