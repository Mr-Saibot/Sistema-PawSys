export class CreateIngresoDto {
  monto: number;
  concepto: string;
  responsable: string;
  formaPago: string;
  origen: string;
  cajaId: number;
  descripcion?: string;
}