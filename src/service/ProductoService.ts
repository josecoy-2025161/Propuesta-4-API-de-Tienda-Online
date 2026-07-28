import { ProductoRepository } from "../data/ProductoRepository";
import { Producto } from '../models/Producto';

export class ProductoService {
    repository = new ProductoRepository();

    // Metodo para obtener productos
    listar = async (): Promise<Producto[]> => {
        return await this.repository.obtenerProductos();
    };

    // Metodo para agregar producto
    agregar = async (producto: Producto): Promise<void> => {
        const productos = await this.repository.obtenerProductos();

        const existeId = productos.some(p => p.id === producto.id);
        if (existeId) {
            throw new Error("YA EXISTE UN PRODUCTO CON ESE ID");
        }

        // Validación inicial: el stock no puede ser negativo
        if (producto.stock < 0) {
            throw new Error("EL STOCK INICIAL NO PUEDE SER NEGATIVO");
        }

        productos.push(producto);
        await this.repository.guardarProductos(productos);
    };

    // Metodo para buscar por ID
    buscar = async (id: number): Promise<Producto | undefined> => {
        const productos = await this.repository.obtenerProductos();
        return productos.find(p => p.id === id);
    };

    // Metodo para actualizar (CRUD general)
    actualizar = async (producto: Producto): Promise<void> => {
        const productos = await this.repository.obtenerProductos();
        const indice = productos.findIndex(p => p.id === producto.id);

        if (indice === -1) {
            throw new Error("PRODUCTO NO EXISTE");
        }

        if (producto.stock < 0) {
            throw new Error("EL STOCK NO PUEDE SER NEGATIVO");
        }

        productos[indice] = producto;
        await this.repository.guardarProductos(productos);
    };

    // Metodo para eliminar
    eliminar = async (id: number): Promise<void> => {
        const productos = await this.repository.obtenerProductos();
        const nuevos = productos.filter(p => p.id !== id);

        if (nuevos.length === productos.length) {
            throw new Error("EL PRODUCTO NO EXISTE");
        }

        await this.repository.guardarProductos(nuevos);
    };

    // --------------------------------------------------------
    // Control de Inventario
    // --------------------------------------------------------

    // Metodo específico para descontar stock de forma segura
    descontarStock = async (id: number, cantidad: number): Promise<void> => {
        const productos = await this.repository.obtenerProductos();
        const indice = productos.findIndex(p => p.id === id);

        if (indice === -1) {
            throw new Error("PRODUCTO NO EXISTE");
        }

        const producto = productos[indice];

        if (producto.stock < cantidad) {
            throw new Error(`STOCK INSUFICIENTE PARA EL PRODUCTO: ${producto.nombre}`);
        }

        producto.stock -= cantidad;

        // Cambio de estado automático si el stock llega a 0
        if (producto.stock === 0) {
            producto.estado = "AGOTADO";
        }

        await this.repository.guardarProductos(productos);
    };

    // Metodo para restituir stock (al cancelar pedido)
    restituirStock = async (id: number, cantidad: number): Promise<void> => {
        const productos = await this.repository.obtenerProductos();
        const indice = productos.findIndex(p => p.id === id);

        if (indice !== -1) {
            productos[indice].stock += cantidad;

            // Si estaba agotado y ahora tiene stock, vuelve a estar disponible
            if (productos[indice].estado === "AGOTADO" && productos[indice].stock > 0) {
                productos[indice].estado = "DISPONIBLE";
            }
            await this.repository.guardarProductos(productos);
        }
    };
}