import { DetallePedidoRepository } from "../data/DetallePedidoRepository";
import { ProductoRepository } from "../data/ProductoRepository";
import { PedidoRepository } from "../data/PedidoRepository";
import { Producto } from "../models/Producto";

export class ReporteService {
    detalleRepo = new DetallePedidoRepository();
    productoRepo = new ProductoRepository();
    pedidoRepo = new PedidoRepository();

    // Recomendación de productos (basado en los más vendidos)
    recomendarProductos = async (): Promise<Producto[]> => {
        const detalles = await this.detalleRepo.obtenerDetalles();
        const productos = await this.productoRepo.obtenerProductos();

        // Diccionario para contar las unidades vendidas de cada producto
        const conteoVentas: Record<number, number> = {};
        
        for (const detalle of detalles) {
            conteoVentas[detalle.productoId] = (conteoVentas[detalle.productoId] || 0) + detalle.cantidad;
        }

        // Ordenar productos de mayor a menor ventas
        const productosOrdenados = productos.sort((a, b) => {
            const ventasA = conteoVentas[a.id] || 0;
            const ventasB = conteoVentas[b.id] || 0;
            return ventasB - ventasA;
        });

        // Retornar el top 5 de productos como recomendaciones
        return productosOrdenados.slice(0, 5);
    };

    // Reportes comerciales (Total de ingresos)
    reporteIngresosTotales = async (): Promise<number> => {
        const pedidos = await this.pedidoRepo.obtenerPedidos();
        
        // Sumar solo los pedidos que se hayan concretado (ignorando cancelados)
        const pedidosValidos = pedidos.filter(p => p.estado !== "CANCELADO");
        
        let ingresosTotales = 0;
        for (const pedido of pedidosValidos) {
            ingresosTotales += pedido.total;
        }

        return ingresosTotales;
    };
}