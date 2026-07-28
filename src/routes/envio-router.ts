import { IncomingMessage, ServerResponse } from "node:http";
import { EnvioService } from "../service/EnvioService";
import { validarEntero, validarCadena, validarOpciones } from "../utils/Validaciones";
import { Envio } from "../models/Envio";

const service = new EnvioService();

export async function routerEnvio(req: IncomingMessage, res: ServerResponse) {
    res.setHeader("Content-type", "application/json");

    const url = req.url ?? "";
    const metodo = req.method ?? "";

    try {
        // GET: Listar todos los envíos
        if (url === "/envios") {
            if (metodo === "GET") {
                const envios = await service.listar();
                res.writeHead(200);
                res.end(JSON.stringify(envios));
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO EN ${url}` }));
                return;
            }
        }

        // POST: Programar un nuevo envío
        if (url === "/envios/crear") {
            if (metodo === "POST") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", async () => {
                    try {
                        const peticion = JSON.parse(body);

                        // Validaciones de los campos del envío
                        validarEntero(peticion.id, "id");
                        validarEntero(peticion.pedidoId, "pedidoId");
                        validarCadena(peticion.direccionEntrega, "direccionEntrega");
                        validarCadena(peticion.fechaEstimada, "fechaEstimada");

                        const estadosPermitidos = ["PREPARANDO", "EN_TRANSITO", "ENTREGADO", "DEVUELTO"];
                        validarOpciones(peticion.estado, "estado", estadosPermitidos);

                        const nuevoEnvio: Envio = {
                            id: peticion.id,
                            pedidoId: peticion.pedidoId,
                            direccionEntrega: peticion.direccionEntrega.trim(),
                            fechaEstimada: peticion.fechaEstimada.trim(),
                            estado: peticion.estado
                        };

                        // Verificará que el pedido exista y no tenga ya un envío
                        await service.crear(nuevoEnvio);

                        res.writeHead(201);
                        res.end(JSON.stringify({
                            mensaje: "ENVÍO PROGRAMADO CORRECTAMENTE",
                            envio: nuevoEnvio
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

        // PUT: Cambiar el estado del envío
        if (url === "/envios/estado") {
            if (metodo === "PUT") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", async () => {
                    try {
                        const peticion = JSON.parse(body);

                        // Validaciones
                        validarEntero(peticion.id, "id");

                        const estadosPermitidos = ["PREPARANDO", "EN_TRANSITO", "ENTREGADO", "DEVUELTO"];
                        validarOpciones(peticion.estado, "estado", estadosPermitidos);

                        await service.cambiarEstado(peticion.id, peticion.estado);

                        res.writeHead(200);
                        res.end(JSON.stringify({ mensaje: `ESTADO DEL ENVÍO ACTUALIZADO A ${peticion.estado}` }));
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

        // RUTA NO ENCONTRADA PARA ENVÍOS
        res.writeHead(404);
        res.end(JSON.stringify({ mensaje: "RUTA DE ENVÍOS NO ENCONTRADA" }));

    } catch (error) {
        // ERROR INTERNO
        res.writeHead(500);
        res.end(JSON.stringify({
            mensaje: "ERROR INTERNO DEL SERVIDOR",
            detalle: (error as Error).message
        }));
    }
}