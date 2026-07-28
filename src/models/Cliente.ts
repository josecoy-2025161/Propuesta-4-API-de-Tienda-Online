import { EstadoCliente } from "./EstadoCliente";

export interface Cliente {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: number;
    direccion: string;
    estado: EstadoCliente;
}