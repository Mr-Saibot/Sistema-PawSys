export interface EventoClinico {
  id: string;
  fecha: string;
  categoria: 'consulta' | 'vacunacion';
  titulo: string;
  diagnostico: string | null;
  tratamiento: string | null;
  veterinario: string;
}

export type PestanaFicha =
  | 'historial'
  | 'vacunas'
  | 'desparasitacion'
  | 'documentos'
  | 'facturacion';
