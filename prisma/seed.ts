import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de base de datos...');

    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const user = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'Admin User',
            isActive: true,
        },
    });

    console.log('✅ Usuario creado:', user.email);

    // Crear productos de prueba
    const products = await Promise.all([
        prisma.product.upsert({
            where: { id: '00000000-0000-0000-0000-000000000001' },
            update: {},
            create: {
                id: '00000000-0000-0000-0000-000000000001',
                name: 'Laptop HP 15',
                description: 'Laptop profesional con procesador Intel i5',
                price: 899.99,
                stock: 15,
                isActive: true,
            },
        }),
        prisma.product.upsert({
            where: { id: '00000000-0000-0000-0000-000000000002' },
            update: {},
            create: {
                id: '00000000-0000-0000-0000-000000000002',
                name: 'Mouse Logitech MX',
                description: 'Mouse inalámbrico ergonómico',
                price: 79.99,
                stock: 50,
                isActive: true,
            },
        }),
        prisma.product.upsert({
            where: { id: '00000000-0000-0000-0000-000000000003' },
            update: {},
            create: {
                id: '00000000-0000-0000-0000-000000000003',
                name: 'Teclado Mecánico RGB',
                description: 'Teclado gaming con switches azules',
                price: 129.99,
                stock: 30,
                isActive: true,
            },
        }),
    ]);

    console.log(`✅ ${products.length} productos creados`);
    console.log('✨ Seed completado!');
}

main()
    .catch((e) => {
        console.error('❌ Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

