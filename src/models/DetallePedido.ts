export interface DetallePedido {
    id: number;
    pedidoId: number;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}