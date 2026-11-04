import { PartialType } from '@nestjs/mapped-types';
import { CreateVacunacionDto } from './create-vacunacione.dto';

export class UpdateVacunacionDto extends PartialType(CreateVacunacionDto) {}