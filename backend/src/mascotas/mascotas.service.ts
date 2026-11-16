import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { MAX_TAMANO_FOTO_BYTES } from './mascotas.constantes';

interface ArchivoFotoMascota {
  buffer: Buffer;
  mimetype: string;
}

interface UsuarioMascota {
  id: number;
  rol: Rol;
}

@Injectable()
export class MascotasService {
  private readonly logger = new Logger(MascotasService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createMascotaDto: CreateMascotaDto, usuario: { id: number; rol: Rol }) {
    let clienteId = createMascotaDto.clienteId;
    if (usuario.rol === Rol.CLIENTE) {
      const cliente = await this.prisma.cliente.findUnique({ where: { usuarioId: usuario.id } });
      if (!cliente) throw new NotFoundException('No existe un perfil de cliente para este usuario');
      clienteId = cliente.id;
    }
    if (!clienteId) throw new NotFoundException('Selecciona el cliente responsable de la mascota');
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException(`El cliente con ID ${clienteId} no existe`);
    }

    return this.prisma.mascota.create({
      data: {
        ...createMascotaDto,
        clienteId,
        historial: { create: {} },
        fechaNacimiento: createMascotaDto.fechaNacimiento
          ? new Date(createMascotaDto.fechaNacimiento)
          : null,
      },
      include: {
        cliente: true,
        historial: true,
      },
    });
  }

  async findAll(usuario: { id: number; rol: Rol }) {
    return this.prisma.mascota.findMany({
      where: usuario.rol === Rol.CLIENTE ? { cliente: { usuarioId: usuario.id } } : undefined,
      include: {
        cliente: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, usuario: UsuarioMascota) {
    const mascota = await this.prisma.mascota.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            usuarioId: true,
          },
        },
        historial: {
          include: {
            consultas: {
              include: { veterinario: true },
              orderBy: { fecha: 'desc' },
            },
            vacunaciones: {
              include: { veterinario: true },
              orderBy: { fecha: 'desc' },
            },
          },
        },
      },
    });

    if (!mascota) {
      throw new NotFoundException(`Mascota con ID ${id} no encontrada`);
    }
    const { usuarioId, ...cliente } = mascota.cliente;
    this.assertOwner(usuarioId, usuario);

    return {
      ...mascota,
      cliente,
    };
  }

  async update(
    id: number,
    updateMascotaDto: UpdateMascotaDto,
    usuario: UsuarioMascota,
  ) {
    await this.findOne(id, usuario);
    if (usuario.rol === Rol.CLIENTE && updateMascotaDto.clienteId !== undefined) {
      throw new ForbiddenException('No puedes cambiar el responsable de tu mascota');
    }

    return this.prisma.mascota.update({
      where: { id },
      data: {
        ...updateMascotaDto,
        fechaNacimiento: updateMascotaDto.fechaNacimiento
          ? new Date(updateMascotaDto.fechaNacimiento)
          : undefined,
      },
      include: { cliente: true },
    });
  }

  async remove(id: number, usuario: UsuarioMascota) {
    await this.findOne(id, usuario);

    return this.prisma.mascota.update({
      where: { id },
      data: { estado: false },
    });
  }

  async guardarFoto(
    id: number,
    archivo: ArchivoFotoMascota,
    usuario: UsuarioMascota,
  ): Promise<{ fotoUrl: string }> {
    const mascota = await this.obtenerMascotaParaFoto(id, usuario);
    const extension = this.obtenerExtensionFoto(archivo);
    const nombreArchivo = `${randomUUID()}.${extension}`;
    const directorio = join(process.cwd(), 'uploads', 'mascotas');
    const rutaArchivo = join(directorio, nombreArchivo);

    await mkdir(directorio, { recursive: true });
    await writeFile(rutaArchivo, archivo.buffer);

    const fotoUrl = `/uploads/mascotas/${nombreArchivo}`;
    try {
      await this.prisma.mascota.update({
        where: { id },
        data: { fotoUrl },
      });
    } catch (causa) {
      await this.eliminarArchivo(rutaArchivo);
      throw causa;
    }

    await this.eliminarFotoAnterior(mascota.fotoUrl);
    return { fotoUrl };
  }

  private async obtenerMascotaParaFoto(id: number, usuario: UsuarioMascota) {
    const mascota = await this.prisma.mascota.findUnique({
      where: { id },
      include: { cliente: { select: { usuarioId: true } } },
    });
    if (!mascota) {
      throw new NotFoundException(`Mascota con ID ${id} no encontrada.`);
    }
    if (
      usuario.rol !== Rol.CLIENTE
      || mascota.cliente.usuarioId !== usuario.id
    ) {
      throw new ForbiddenException(
        'Solo puedes cambiar la foto de una mascota propia.',
      );
    }
    return mascota;
  }

  private obtenerExtensionFoto(archivo: ArchivoFotoMascota): string {
    if (archivo.buffer.length > MAX_TAMANO_FOTO_BYTES) {
      throw new BadRequestException('La foto no puede superar los 3 MB.');
    }

    const extension = this.extensionDeFirma(archivo.buffer, archivo.mimetype);
    if (!extension) {
      throw new BadRequestException(
        'Usa una imagen JPG, PNG o WebP válida.',
      );
    }
    return extension;
  }

  private extensionDeFirma(buffer: Buffer, tipo: string): string | null {
    const esJpeg =
      tipo === 'image/jpeg'
      && buffer[0] === 0xff
      && buffer[1] === 0xd8
      && buffer[2] === 0xff;
    const esPng =
      tipo === 'image/png'
      && buffer.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      );
    const esWebp =
      tipo === 'image/webp'
      && buffer.toString('ascii', 0, 4) === 'RIFF'
      && buffer.toString('ascii', 8, 12) === 'WEBP';

    if (esJpeg) {
      return 'jpg';
    }
    if (esPng) {
      return 'png';
    }
    if (esWebp) {
      return 'webp';
    }
    return null;
  }

  private async eliminarFotoAnterior(fotoUrl: string | null): Promise<void> {
    if (!fotoUrl?.startsWith('/uploads/mascotas/')) {
      return;
    }

    const ruta = join(
      process.cwd(),
      'uploads',
      'mascotas',
      basename(fotoUrl),
    );
    await this.eliminarArchivo(ruta);
  }

  private async eliminarArchivo(ruta: string): Promise<void> {
    try {
      await unlink(ruta);
    } catch (causa) {
      if (!this.esArchivoInexistente(causa)) {
        this.logger.error(
          'No se pudo limpiar un archivo de foto de mascota.',
          causa instanceof Error ? causa.stack : undefined,
        );
      }
    }
  }

  private esArchivoInexistente(causa: unknown): boolean {
    return (
      Boolean(causa)
      && typeof causa === 'object'
      && causa !== null
      && Reflect.get(causa, 'code') === 'ENOENT'
    );
  }

  private assertOwner(clienteUsuarioId: number, usuario: UsuarioMascota): void {
    if (usuario.rol === Rol.CLIENTE && clienteUsuarioId !== usuario.id) {
      throw new ForbiddenException('No tienes permiso para acceder a esta mascota');
    }
  }
}