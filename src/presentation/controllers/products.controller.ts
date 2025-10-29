import { Controller, Get, Post, Put, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateProductCommand } from '@application/use-cases/product/commands/create-product.command';
import { UpdateProductCommand } from '@application/use-cases/product/commands/update-product.command';
import { GetProductsPaginatedQuery } from '@application/use-cases/product/queries/get-products-paginated.query';
import { CreateProductDto } from '@presentation/dtos/create-product.dto';
import { UpdateProductDto } from '@presentation/dtos/update-product.dto';

/**
 * Controller: Products
 * 
 * Demuestra:
 * - Paginación
 * - Actualización parcial
 */
@Controller('products')
export class ProductsController {
    constructor(
        private readonly createProductCommand: CreateProductCommand,
        private readonly updateProductCommand: UpdateProductCommand,
        private readonly getProductsPaginatedQuery: GetProductsPaginatedQuery,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createProductDto: CreateProductDto) {
        const product = await this.createProductCommand.execute(createProductDto);

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price.getValue(),
            stock: product.stock,
            isActive: product.isActive,
            createdAt: product.createdAt,
        };
    }

    @Get()
    async findAll(
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '10',
    ) {
        const result = await this.getProductsPaginatedQuery.execute({
            page: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10),
        });

        return {
            data: result.data.map((product) => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price.getValue(),
                stock: product.stock,
                isActive: product.isActive,
                createdAt: product.createdAt,
            })),
            meta: {
                total: result.total,
                page: result.page,
                pageSize: result.pageSize,
                totalPages: result.totalPages,
            },
        };
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        const product = await this.updateProductCommand.execute(id, updateProductDto);

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price.getValue(),
            stock: product.stock,
            isActive: product.isActive,
            updatedAt: product.updatedAt,
        };
    }
}

