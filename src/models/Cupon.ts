import { EstadoCupon } from "./EstadoCupon";

export interface Cupon {
    id: number;
    codigo: string;
    porcentajeDescuento: number;
    limiteUso: number;
    usosActuales: number;
    estado: EstadoCupon;
}