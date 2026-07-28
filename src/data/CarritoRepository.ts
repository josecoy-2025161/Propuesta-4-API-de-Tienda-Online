import { readFile, writeFile } from "fs/promises";
import { Carrito } from "../models/Carrito";

export class CarritoRepository {
    
    ruta = "./src/data/carritos.json";

    async obtenerCarritos(): Promise<Carrito[]> {
        try {
            const datos = await readFile(this.ruta, "utf-8");
            return JSON.parse(datos);
        } catch (error) {
            return [];
        }
    }

    async guardarCarritos(carritos: Carrito[]): Promise<void> {
        try {
            await writeFile(
                this.ruta,
                JSON.stringify(carritos, null, 4)
            );
        } catch (error) {
            console.log("Error al guardar carritos.");
            throw error; 
        }
    } 
}