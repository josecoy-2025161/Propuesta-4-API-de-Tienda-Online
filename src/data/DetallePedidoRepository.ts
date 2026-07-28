import { readFile, writeFile } from "fs/promises";
import { DetallePedido } from "../models/DetallePedido";

export class DetallePedidoRepository {
    
    ruta = "./src/data/detalles_pedidos.json";

    async obtenerDetalles(): Promise<DetallePedido[]> {
        try {
            const datos = await readFile(this.ruta, "utf-8");
            return JSON.parse(datos);
        } catch (error) {
            return [];
        }
    }

    async guardarDetalles(detalles: DetallePedido[]): Promise<void> {
        try {
            await writeFile(
                this.ruta,
                JSON.stringify(detalles, null, 4)
            );
        } catch (error) {
            console.log("Error al guardar detalles de pedido.");
            throw error; 
        }
    } 
}