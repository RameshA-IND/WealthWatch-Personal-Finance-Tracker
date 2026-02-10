
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query, Put } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('expenses')
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Post()
    create(@Body() createExpenseDto: any, @Request() req) {
        return this.expensesService.create(createExpenseDto, req.user.userId);
    }

    @Get()
    findAll(@Request() req, @Query() query) {
        return this.expensesService.findAll(req.user.userId, query);
    }

    @Get('dashboard')
    getDashboard(@Request() req) {
        return this.expensesService.getDashboardStats(req.user.userId);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateExpenseDto: any) {
        return this.expensesService.update(+id, updateExpenseDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.expensesService.remove(+id);
    }
}
