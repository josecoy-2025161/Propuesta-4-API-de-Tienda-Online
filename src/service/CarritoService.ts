import { CarritoRepository } from "../data/CarritoRepository";
import { ProductoRepository } from "../data/ProductoRepository";
import { Carrito } from "../models/Carrito";
import { ItemCarrito } from "../models/ItemCarrito";
import { Producto } from "../models/Producto";

export class CarritoService {
    repository = new CarritoRepository();
    // Instanciamos el repositorio de productos para leer precios y stock
    productoRepo = new ProductoRepository();

    // Metodo para listar todos los carritos (útil para el admin)
    listar = async (): Promise<Carrito[]> => {
        return await this.repository.obtenerCarritos();
    };

    // Metodo para abrir un carrito nuevo para un cliente
    crear = async (clienteId: number): Promise<Carrito> => {
        const carritos = await this.repository.obtenerCarritos();

        // Generamos un ID autoincremental simple
        const nuevoId = carritos.length > 0 ? Math.max(...carritos.map(c => c.id)) + 1 : 1;

        const nuevoCarrito: Carrito = {
            id: nuevoId,
            clienteId: clienteId,
            items: [],
            total: 0, // Inicia en 0, lo calculará el servidor
            estado: "ACTIVO"
        };

        carritos.push(nuevoCarrito);
        await this.repository.guardarCarritos(carritos);
        return nuevoCarrito;
    };

    // Metodo para agregar un ítem al carrito
    agregarItem = async (carritoId: number, item: ItemCarrito): Promise<void> => {
        const carritos = await this.repository.obtenerCarritos();
        const indexCarrito = carritos.findIndex(c => c.id === carritoId && c.estado === "ACTIVO");

        if (indexCarrito === -1) {
            throw new Error("EL CARRITO NO EXISTE O NO ESTA ACTIVO");
        }

        const productos = await this.productoRepo.obtenerProductos();
        const producto = productos.find(p => p.id === item.productoId);

        if (!producto) {
            throw new Error("EL PRODUCTO NO EXISTE");
        }

        // Regla: No vender más del stock
        if (producto.stock < item.cantidad) {
            throw new Error("STOCK INSUFICIENTE: NO SE PUEDE VENDER MAS DEL DISPONIBLE");
        }

        const carrito = carritos[indexCarrito];

        // Verificamos si el producto ya está en el carrito para sumar la cantidad
        const indexItem = carrito.items.findIndex(i => i.productoId === item.productoId);
        if (indexItem !== -1) {
            const nuevaCantidad = carrito.items[indexItem].cantidad + item.cantidad;

            // Volvemos a validar el stock con la nueva cantidad acumulada
            if (producto.stock < nuevaCantidad) {
                throw new Error("LA CANTIDAD TOTAL EN EL CARRITO SUPERA EL STOCK DISPONIBLE");
            }

            carrito.items[indexItem].cantidad = nuevaCantidad;
        } else {
            carrito.items.push(item);
        }

        // Total calculado por el servidor
        carrito.total = this.calcularTotal(carrito.items, productos);

        await this.repository.guardarCarritos(carritos);
    };

    // Metodo auxiliar para recalcular el total 
    calcularTotal = (items: ItemCarrito[], productos: Producto[]): number => {
        let total = 0;
        for (const item of items) {
            const prod = productos.find(p => p.id === item.productoId);
            if (prod) {
                total += prod.precio * item.cantidad;
            }
        }
        return total;
    };
}