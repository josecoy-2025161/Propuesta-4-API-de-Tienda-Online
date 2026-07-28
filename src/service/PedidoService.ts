import { PedidoRepository } from "../data/PedidoRepository";
import { CarritoRepository } from "../data/CarritoRepository";
import { CuponRepository } from "../data/CuponRepository";
import { DetallePedidoRepository } from "../data/DetallePedidoRepository";
import { ProductoService } from "./ProductoService";
import { Pedido } from "../models/Pedido";
import { DetallePedido } from "../models/DetallePedido";
import { EstadoPedido } from "../models/EstadoPedido";

export class PedidoService {
    repository = new PedidoRepository();
    carritoRepo = new CarritoRepository();
    cuponRepo = new CuponRepository();
    detalleRepo = new DetallePedidoRepository();

    // Instanciamos el servicio de productos para poder descontar y restituir stock
    productoService = new ProductoService();

    // Metodo para listar pedidos
    listar = async (): Promise<Pedido[]> => {
        return await this.repository.obtenerPedidos();
    };

    // Metodo para confirmar un pedido a partir de un carrito activo
    confirmarPedido = async (clienteId: number, carritoId: number, codigoCupon?: string): Promise<Pedido> => {
        const carritos = await this.carritoRepo.obtenerCarritos();
        const carrito = carritos.find(c => c.id === carritoId && c.clienteId === clienteId && c.estado === "ACTIVO");

        if (!carrito) {
            throw new Error("CARRITO NO ENCONTRADO O YA FUE PROCESADO");
        }

        if (carrito.items.length === 0) {
            throw new Error("EL CARRITO ESTA VACIO");
        }

        let totalFinal = carrito.total;
        let cuponId: number | null = null;

        // Aplicación de cupones
        if (codigoCupon) {
            const cupones = await this.cuponRepo.obtenerCupones();
            const cuponIndex = cupones.findIndex(c => c.codigo === codigoCupon && c.estado === "ACTIVO");

            if (cuponIndex === -1) {
                throw new Error("CUPON INVALIDO O INACTIVO");
            }

            const cupon = cupones[cuponIndex];

            // Aplicar descuento
            const descuento = (totalFinal * cupon.porcentajeDescuento) / 100;
            totalFinal -= descuento;
            cuponId = cupon.id;

            // Actualizar usos del cupón
            cupon.usosActuales += 1;
            if (cupon.usosActuales >= cupon.limiteUso) {
                cupon.estado = "AGOTADO";
            }
            await this.cuponRepo.guardarCupones(cupones);
        }

        // Descontar inventario
        for (const item of carrito.items) {
            await this.productoService.descontarStock(item.productoId, item.cantidad);
        }

        // Cambiar estado del carrito
        carrito.estado = "COMPLETADO";
        await this.carritoRepo.guardarCarritos(carritos);

        // Crear el pedido
        const pedidos = await this.repository.obtenerPedidos();
        const nuevoPedidoId = pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1;

        const nuevoPedido: Pedido = {
            id: nuevoPedidoId,
            clienteId: clienteId,
            fecha: new Date().toISOString(),
            total: totalFinal,
            cuponId: cuponId,
            estado: "PENDIENTE"
        };

        pedidos.push(nuevoPedido);
        await this.repository.guardarPedidos(pedidos);

        // Crear el Detalle de Pedidos
        const detalles = await this.detalleRepo.obtenerDetalles();
        let detalleId = detalles.length > 0 ? Math.max(...detalles.map(d => d.id)) + 1 : 1;

        const productos = await this.productoService.listar();

        for (const item of carrito.items) {
            const prod = productos.find(p => p.id === item.productoId);
            if (prod) {
                const nuevoDetalle: DetallePedido = {
                    id: detalleId++,
                    pedidoId: nuevoPedidoId,
                    productoId: item.productoId,
                    cantidad: item.cantidad,
                    precioUnitario: prod.precio,
                    subtotal: prod.precio * item.cantidad
                };
                detalles.push(nuevoDetalle);
            }
        }
        await this.detalleRepo.guardarDetalles(detalles);

        return nuevoPedido;
    };

    // Cambios de estado
    cambiarEstado = async (pedidoId: number, nuevoEstado: EstadoPedido): Promise<void> => {
        const pedidos = await this.repository.obtenerPedidos();
        const pedido = pedidos.find(p => p.id === pedidoId);

        if (!pedido) {
            throw new Error("PEDIDO NO ENCONTRADO");
        }

        // Restituir stock al cancelar
        if (nuevoEstado === "CANCELADO" && pedido.estado !== "CANCELADO") {
            const detalles = await this.detalleRepo.obtenerDetalles();
            const detallesDelPedido = detalles.filter(d => d.pedidoId === pedidoId);

            for (const detalle of detallesDelPedido) {
                await this.productoService.restituirStock(detalle.productoId, detalle.cantidad);
            }
        }

        pedido.estado = nuevoEstado;
        await this.repository.guardarPedidos(pedidos);
    };
}