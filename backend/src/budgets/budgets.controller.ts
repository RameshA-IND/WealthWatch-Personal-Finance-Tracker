
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Put } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('budgets')
export class BudgetsController {
    constructor(private readonly budgetsService: BudgetsService) { }

    @Post()
    create(@Body() createBudgetDto: any, @Request() req) {
        return this.budgetsService.create(createBudgetDto, req.user.userId);
    }

    @Get()
    findAll(@Request() req) {
        return this.budgetsService.findAll(req.user.userId);
    }

    @Get('alerts')
    checkAlerts(@Request() req) {
        return this.budgetsService.checkBudgetAlerts(req.user.userId);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateBudgetDto: any) {
        return this.budgetsService.update(+id, updateBudgetDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.budgetsService.remove(+id);
    }
}
