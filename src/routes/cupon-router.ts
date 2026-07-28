import { IncomingMessage, ServerResponse } from "node:http";
import { CuponService } from "../service/CuponService";
import { validarCadena, validarEntero, validarNumeroPositivo, validarOpciones } from "../utils/Validaciones";
import { Cupon } from "../models/Cupon";

const service = new CuponService();

export async function routerCupon(req: IncomingMessage, res: ServerResponse) {
    res.setHeader("Content-type", "application/json");

    const url = req.url ?? "";
    const metodo = req.method ?? "";

    try {
        // GET: Listar todos los cupones
        if (url === "/cupones") {
            if (metodo === "GET") {
                const cupones = await service.listar();
                res.writeHead(200);
                res.end(JSON.stringify(cupones));
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO EN ${url}` }));
                return;
            }
        }

        // POST: Agregar un nuevo cupón
        if (url === "/cupones/agregar") {
            if (metodo === "POST") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", async () => {
                    try {
                        const peticion = JSON.parse(body);

                        // Validaciones de los campos del cupón
                        validarEntero(peticion.id, "id");
                        validarCadena(peticion.codigo, "codigo");
                        validarNumeroPositivo(peticion.porcentajeDescuento, "porcentajeDescuento");
                        validarEntero(peticion.limiteUso, "limiteUso");
                        validarEntero(peticion.usosActuales, "usosActuales");

                        const estadosPermitidos = ["ACTIVO", "EXPIRADO", "AGOTADO"];
                        validarOpciones(peticion.estado, "estado", estadosPermitidos);

                        // Validación adicional: el porcentaje no debería ser mayor a 100
                        if (peticion.porcentajeDescuento > 100) {
                            throw new Error("EL PORCENTAJE DE DESCUENTO NO PUEDE SER MAYOR A 100");
                        }

                        const nuevoCupon: Cupon = {
                            id: peticion.id,
                            codigo: peticion.codigo.trim(),
                            porcentajeDescuento: peticion.porcentajeDescuento,
                            limiteUso: peticion.limiteUso,
                            usosActuales: peticion.usosActuales,
                            estado: peticion.estado
                        };

                        await service.agregar(nuevoCupon);

                        res.writeHead(201);
                        res.end(JSON.stringify({
                            mensaje: "CUPÓN AGREGADO CORRECTAMENTE",
                            cupon: nuevoCupon
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

        // POST: Buscar un cupón por su código
        if (url === "/cupones/buscar") {
            if (metodo === "POST") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", async () => {
                    try {
                        const peticion = JSON.parse(body);

                        validarCadena(peticion.codigo, "codigo");

                        const cupon = await service.buscarPorCodigo(peticion.codigo.trim());

                        if (!cupon) {
                            res.writeHead(404);
                            res.end(JSON.stringify({ mensaje: "CUPÓN NO ENCONTRADO" }));
                            return;
                        }

                        res.writeHead(200);
                        res.end(JSON.stringify(cupon));
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

        // DELETE: Eliminar un cupón
        if (url === "/cupones/eliminar") {
            if (metodo === "DELETE") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", async () => {
                    try {
                        const peticion = JSON.parse(body);

                        validarEntero(peticion.id, "id");

                        await service.eliminar(peticion.id);

                        res.writeHead(200);
                        res.end(JSON.stringify({ mensaje: "CUPÓN ELIMINADO CORRECTAMENTE" }));
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

        // RUTA NO ENCONTRADA PARA CUPONES
        res.writeHead(404);
        res.end(JSON.stringify({ mensaje: "RUTA DE CUPONES NO ENCONTRADA" }));

    } catch (error) {
        // ERROR INTERNO
        res.writeHead(500);
        res.end(JSON.stringify({
            mensaje: "ERROR INTERNO DEL SERVIDOR",
            detalle: (error as Error).message
        }));
    }
}