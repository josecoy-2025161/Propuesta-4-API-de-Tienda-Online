import { EstadoPedido } from "./EstadoPedido";

export interface Pedido {
    id: number;
    clienteId: number;
    fecha: string;
    total: number;
    cuponId: number | null; // null si no usó cupón
    estado: EstadoPedido;
}