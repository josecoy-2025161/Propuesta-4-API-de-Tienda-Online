import { readFile, writeFile } from "fs/promises";
import { Envio } from "../models/Envio";

export class EnvioRepository {
    
    ruta = "./src/data/envios.json";

    async obtenerEnvios(): Promise<Envio[]> {
        try {
            const datos = await readFile(this.ruta, "utf-8");
            return JSON.parse(datos);
        } catch (error) {
            return [];
        }
    }

    async guardarEnvios(envios: Envio[]): Promise<void> {
        try {
            await writeFile(
                this.ruta,
                JSON.stringify(envios, null, 4)
            );
        } catch (error) {
            console.log("Error al guardar envíos.");
            throw error; 
        }
    } 
}