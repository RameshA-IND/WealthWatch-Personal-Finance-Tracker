
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    create(@Body() createCategoryDto: any, @Request() req) {
        return this.categoriesService.create(createCategoryDto, req.user.userId);
    }

    @Get()
    findAll(@Request() req) {
        return this.categoriesService.findAll(req.user.userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(+id);
    }
}
