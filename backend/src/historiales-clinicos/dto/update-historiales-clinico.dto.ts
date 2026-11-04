import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialClinicoDto } from './create-historiales-clinico.dto';

export class UpdateHistorialClinicoDto extends PartialType(CreateHistorialClinicoDto) {}