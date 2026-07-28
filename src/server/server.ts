import { createServer } from "node:http";
import { routerCliente } from "../routes/cliente-router";
import { routerProducto } from "../routes/producto-router";
import { routerCarrito } from "../routes/carrito-router";
import { routerPedido } from "../routes/pedido-router";
import { routerCupon } from "../routes/cupon-router";
import { routerEnvio } from "../routes/envio-router";
import { routerReporte } from "../routes/reporte-router";

const servidor = createServer(async (req, res) => {
    const url = req.url ?? "";

    try {
        // Redirige la consulta al router correspondiente
        if (url.startsWith("/clientes")) {
            await routerCliente(req, res);
        }
        else if (url.startsWith("/productos")) {
            await routerProducto(req, res);
        }
        else if (url.startsWith("/carritos")) {
            await routerCarrito(req, res);
        }
        else if (url.startsWith("/pedidos")) {
            await routerPedido(req, res);
        }
        else if (url.startsWith("/cupones")) {
            await routerCupon(req, res);
        }
        else if (url.startsWith("/envios")) {
            await routerEnvio(req, res);
        }
        else if (url.startsWith("/reportes")) {
            await routerReporte(req, res);
        }
        else {
            // Si no coincide con ninguna ruta principal, devuelve error 404
            res.setHeader("Content-type", "application/json");
            res.writeHead(404);
            res.end(JSON.stringify({ mensaje: "RUTA NO ENCONTRADA" }));
        }
    } catch (error) {
        // Captura cualquier error fatal no manejado por los routers
        console.error("Error en el servidor:", error);
        res.setHeader("Content-type", "application/json");
        res.writeHead(500);
        res.end(JSON.stringify({ mensaje: "ERROR INTERNO DEL SERVIDOR" }));
    }
});

servidor.listen(8090, () => {
    console.log("\n=======================================");
    console.log("   Servidor E-Commerce Iniciado");
    console.log("   URL: http://localhost:8090");
    console.log("=======================================\n");
});