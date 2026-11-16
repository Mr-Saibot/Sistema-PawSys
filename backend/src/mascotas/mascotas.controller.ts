import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Rol } from '@prisma/client';
import { MascotasService } from './mascotas.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MAX_TAMANO_FOTO_BYTES } from './mascotas.constantes';

interface ArchivoFoto {
  buffer: Buffer;
  mimetype: string;
}

interface AuthenticatedRequest extends Request {
  user: { id: number; rol: Rol };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.CLIENTE, Rol.VETERINARIO, Rol.ADMINISTRADOR)
@Controller('mascotas')
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @Post()
  create(@Body() createMascotaDto: CreateMascotaDto, @Req() req: AuthenticatedRequest) {
    return this.mascotasService.create(createMascotaDto, req.user);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.mascotasService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.mascotasService.findOne(id, req.user);
  }

  @Post(':id/foto')
  @Roles(Rol.CLIENTE)
  @UseInterceptors(FileInterceptor('foto', {
    limits: { fileSize: MAX_TAMANO_FOTO_BYTES },
  }))
  subirFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() archivo: ArchivoFoto | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!archivo) {
      throw new BadRequestException('Selecciona una imagen de tu mascota.');
    }

    return this.mascotasService.guardarFoto(id, archivo, req.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMascotaDto: UpdateMascotaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.mascotasService.update(id, updateMascotaDto, req.user);
  }

  @Delete(':id')
  @Roles(Rol.VETERINARIO, Rol.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.mascotasService.remove(id, req.user);
  }
}