import { IncomingMessage, ServerResponse } from "node:http";
import { PedidoService } from "../service/PedidoService";
import { validarEntero, validarOpciones } from "../utils/Validaciones";

const service = new PedidoService();

export async function routerPedido(req: IncomingMessage, res: ServerResponse) {
    res.setHeader("Content-type", "application/json");

    const url = req.url ?? "";
    const metodo = req.method ?? "";

    try {
        // GET: Listar todos los pedidos 
        if (url === "/pedidos") {
            if (metodo === "GET") {
                const pedidos = await service.listar();
                res.writeHead(200);
                res.end(JSON.stringify(pedidos));
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO EN ${url}` }));
                return;
            }
        }

        // POST: Confirmar un pedido desde un carrito activo
        if (url === "/pedidos/confirmar") {
            if (metodo === "POST") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", async () => {
                    try {
                        const peticion = JSON.parse(body);

                        // Validaciones de los datos recibidos
                        validarEntero(peticion.clienteId, "clienteId");
                        validarEntero(peticion.carritoId, "carritoId");

                        // codigoCupon es opcional, pero si viene debe ser procesado
                        const codigoCupon = peticion.codigoCupon && peticion.codigoCupon.trim() !== ""
                            ? peticion.codigoCupon.trim()
                            : undefined;

                        // Confirmar pedido (genera detalles, resta stock, aplica cupones y cambia carrito a COMPLETADO)
                        const nuevoPedido = await service.confirmarPedido(
                            peticion.clienteId,
                            peticion.carritoId,
                            codigoCupon
                        );

                        res.writeHead(201);
                        res.end(JSON.stringify({
                            mensaje: "PEDIDO CONFIRMADO EXITOSAMENTE",
                            pedido: nuevoPedido
                        }));
                    } catch (error) {
                        if (error instanceof SyntaxError) {
                            res.writeHead(400);
                            res.end(JSON.stringify({
                                mensaje: "JSON INVÁLIDO: Verifica la sintaxis de tu petición."
                            }));
                            return;
                        }

                        res.writeHead(400);
                        res.end(JSON.stringify({ mensaje: (error as Error).message }));
                    }
                });
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO EN ${url}` }));
                return;
            }
        }

        // PUT: Cambiar el estado de un pedido (ej. de PENDIENTE a ENVIADO o CANCELADO)
        if (url === "/pedidos/estado") {
            if (metodo === "PUT") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", async () => {
                    try {
                        const peticion = JSON.parse(body);

                        // Validaciones
                        validarEntero(peticion.pedidoId, "pedidoId");

                        const estadosPermitidos = [
                            "PENDIENTE",
                            "PAGADO",
                            "EN_PREPARACION",
                            "ENVIADO",
                            "ENTREGADO",
                            "CANCELADO"
                        ];
                        validarOpciones(peticion.estado, "estado", estadosPermitidos);

                        // (maneja restitución de stock si se cancela)
                        await service.cambiarEstado(peticion.pedidoId, peticion.estado);

                        res.writeHead(200);
                        res.end(JSON.stringify({ mensaje: `ESTADO DEL PEDIDO ACTUALIZADO A ${peticion.estado}` }));
                    } catch (error) {
                        if (error instanceof SyntaxError) {
                            res.writeHead(400);
                            res.end(JSON.stringify({
                                mensaje: "JSON INVÁLIDO: Verifica la sintaxis de tu petición."
                            }));
                            return;
                        }

                        res.writeHead(400);
                        res.end(JSON.stringify({ mensaje: (error as Error).message }));
                    }
                });
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO EN ${url}` }));
                return;
            }
        }

        // RUTA NO ENCONTRADA PARA PEDIDOS
        res.writeHead(404);
        res.end(JSON.stringify({ mensaje: "RUTA DE PEDIDOS NO ENCONTRADA" }));

    } catch (error) {
        // ERROR INTERNO
        res.writeHead(500);
        res.end(JSON.stringify({
            mensaje: "ERROR INTERNO DEL SERVIDOR",
            detalle: (error as Error).message
        }));
    }
}