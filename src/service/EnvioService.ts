import { EnvioRepository } from "../data/EnvioRepository";
import { PedidoRepository } from "../data/PedidoRepository";
import { Envio } from "../models/Envio";
import { EstadoEnvio } from "../models/EstadoEnvio";

export class EnvioService {
    repository = new EnvioRepository();
    pedidoRepo = new PedidoRepository();

    // Metodo para listar envíos
    listar = async (): Promise<Envio[]> => {
        return await this.repository.obtenerEnvios();
    };

    // Metodo para programar un envío
    crear = async (envio: Envio): Promise<void> => {
        const pedidos = await this.pedidoRepo.obtenerPedidos();
        const pedidoExiste = pedidos.some(p => p.id === envio.pedidoId);

        if (!pedidoExiste) {
            throw new Error("EL PEDIDO ASOCIADO NO EXISTE");
        }

        const envios = await this.repository.obtenerEnvios();
        
        // Evitar que un mismo pedido tenga múltiples envíos
        const envioExiste = envios.some(e => e.pedidoId === envio.pedidoId);
        if (envioExiste) {
            throw new Error("ESTE PEDIDO YA TIENE UN ENVIO ASIGNADO");
        }

        envios.push(envio);
        await this.repository.guardarEnvios(envios);
    };

    // Metodo para actualizar el estado del envío
    cambiarEstado = async (id: number, nuevoEstado: EstadoEnvio): Promise<void> => {
        const envios = await this.repository.obtenerEnvios();
        const indice = envios.findIndex(e => e.id === id);

        if (indice === -1) {
            throw new Error("ENVIO NO ENCONTRADO");
        }

        envios[indice].estado = nuevoEstado;
        await this.repository.guardarEnvios(envios);
    };
}