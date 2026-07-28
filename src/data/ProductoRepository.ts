import { readFile, writeFile } from "fs/promises";
import { Producto } from "../models/Producto";

export class ProductoRepository {
    
    // Dar la ruta donde se almacena mi archivo JSON
    ruta = "./src/data/productos.json";

    // Metodo para obtenerProductos | mostrar los datos
    async obtenerProductos(): Promise<Producto[]> {
        try {
            const datos = await readFile(this.ruta, "utf-8");
            return JSON.parse(datos);
        } catch (error) {
            return [];
        }
    }

    // Metodo para guardarProductos | para actualizar
    async guardarProductos(productos: Producto[]): Promise<void> {
        try {
            await writeFile(
                this.ruta,
                JSON.stringify(productos, null, 4)
            );
        } catch (error) {
            console.log("Error al guardar productos.");
            throw error; 
        }
    } 
}