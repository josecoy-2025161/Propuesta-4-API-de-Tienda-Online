import { EstadoCarrito } from "./EstadoCarrito";
import { ItemCarrito } from "./ItemCarrito";

export interface Carrito {
    id: number;
    clienteId: number;
    items: ItemCarrito[];
    total: number;
    estado: EstadoCarrito;
}