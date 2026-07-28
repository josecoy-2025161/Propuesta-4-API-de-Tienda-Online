import { readFile, writeFile } from "fs/promises";
import { Pedido } from "../models/Pedido";

export class PedidoRepository {
    
    ruta = "./src/data/pedidos.json";

    async obtenerPedidos(): Promise<Pedido[]> {
        try {
            const datos = await readFile(this.ruta, "utf-8");
            return JSON.parse(datos);
        } catch (error) {
            return [];
        }
    }

    async guardarPedidos(pedidos: Pedido[]): Promise<void> {
        try {
            await writeFile(
                this.ruta,
                JSON.stringify(pedidos, null, 4)
            );
        } catch (error) {
            console.log("Error al guardar pedidos.");
            throw error; 
        }
    } 
}