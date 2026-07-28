import { readFile, writeFile } from "fs/promises";
import { Cliente } from "../models/Cliente";

export class ClienteRepository {
    
    // Dar la ruta donde se almacena mi archivo JSON
    ruta = "./src/data/clientes.json";

    // Metodo para obtenerClientes | mostrar los datos
    async obtenerClientes(): Promise<Cliente[]> {
        try {
            const datos = await readFile(this.ruta, "utf-8");
            return JSON.parse(datos);
        } catch (error) {
            return [];
        }
    }

    // Metodo para guardarClientes | para actualizar
    async guardarClientes(clientes: Cliente[]): Promise<void> {
        try {
            await writeFile(
                this.ruta,
                JSON.stringify(clientes, null, 4)
            );
        } catch (error) {
            console.log("Error al guardar clientes.");
            throw error; 
        }
    } 
}