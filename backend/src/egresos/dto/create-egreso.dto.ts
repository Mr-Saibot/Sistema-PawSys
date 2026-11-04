export class CreateEgresoDto {
  monto: number;
  concepto: string;
  responsable: string;
  categoria: string;
  cajaId: number;
  descripcion?: string;
  proveedor?: string;
}