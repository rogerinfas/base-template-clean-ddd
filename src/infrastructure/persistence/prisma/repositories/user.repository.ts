import { Injectable } from '@nestjs/common';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user/user.entity';
import { PrismaService } from '@config/prisma/prisma.service';
import { UserMapper } from '../mappers/user.mapper';

/**
 * Implementación concreta del repositorio User usando Prisma.
 * 
 * Implementa la interfaz definida en el dominio.
 */
@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string, includeRoles: boolean = false): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: includeRoles
                ? {
                      roles: {
                          include: {
                              role: {
                                  include: {
                                      permissions: {
                                          include: {
                                              permission: true,
                                          },
                                      },
                                  },
                              },
                          },
                      },
                  }
                : undefined,
        });

        return user ? UserMapper.toDomain(user) : null;
    }

    async findByEmail(email: string, includeRoles: boolean = false): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: includeRoles
                ? {
                      roles: {
                          include: {
                              role: {
                                  include: {
                                      permissions: {
                                          include: {
                                              permission: true,
                                          },
                                      },
                                  },
                              },
                          },
                      },
                  }
                : undefined,
        });

        return user ? UserMapper.toDomain(user) : null;
    }

    async findAll(includeRoles: boolean = false): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: includeRoles
                ? {
                      roles: {
                          include: {
                              role: {
                                  include: {
                                      permissions: {
                                          include: {
                                              permission: true,
                                          },
                                      },
                                  },
                              },
                          },
                      },
                  }
                : undefined,
        });

        return users.map((user) => UserMapper.toDomain(user));
    }

    async create(user: User): Promise<User> {
        const prismaUser = UserMapper.toPrisma(user);

        const created = await this.prisma.user.create({
            data: {
                ...prismaUser,
                roles: {
                    create: user.roles.map((role) => ({
                        role: {
                            connect: { id: role.id as string },
                        },
                    })),
                },
            },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return UserMapper.toDomain(created);
    }

    async update(id: string, user: Partial<User>): Promise<User> {
        const prismaUser = user as User;
        const userData = UserMapper.toPrisma(prismaUser);

        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                ...userData,
                ...(user.roles && {
                    roles: {
                        deleteMany: {},
                        create: user.roles.map((role) => ({
                            role: {
                                connect: { id: role.id as string },
                            },
                        })),
                    },
                }),
            },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return UserMapper.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }

    async existsByEmail(email: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { email },
        });

        return count > 0;
    }

    async existsByIdNumber(idNumber: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { idNumber },
        });

        return count > 0;
    }
}

