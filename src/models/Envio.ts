import { EstadoEnvio } from "./EstadoEnvio";

export interface Envio {
    id: number;
    pedidoId: number;
    direccionEntrega: string;
    fechaEstimada: string;
    estado: EstadoEnvio;
}