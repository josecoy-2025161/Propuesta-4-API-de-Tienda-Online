import { EstadoProducto } from "./EstadoProducto";
import { CategoriaProducto } from "./CategoriaProducto";

export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    categoria: CategoriaProducto; 
    estado: EstadoProducto;
}