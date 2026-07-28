import { IncomingMessage, ServerResponse } from "node:http";
import { ClienteService } from "../service/ClienteService";
import {
    validarEntero,
    validarTexto,
    validarCorreo,
    validarCadena,
    validarOpciones,
    validarTelefono
} from "../utils/Validaciones";

const service = new ClienteService();

export async function routerCliente(req: IncomingMessage, res: ServerResponse) {
    res.setHeader("Content-type", "application/json");

    const url = req.url ?? "";
    const metodo = req.method ?? "";

    try {

        // GET: Listar todos los clientes
        if (url === "/clientes") {
            if (metodo === "GET") {
                const clientes = await service.listar();
                res.writeHead(200);
                res.end(JSON.stringify(clientes));
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO EN ${url}` }));
                return;
            }
        }

        // POST: Agregar un nuevo cliente
        if (url === "/clientes/post") {
            if (metodo === "POST") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", async () => {
                    try {
                        const cliente = JSON.parse(body);

                        // VALIDACIONES DE ENTRADA PARA CLIENTE
                        validarEntero(cliente.id, "ID");
                        validarTexto(cliente.nombre, "Nombre");
                        validarTexto(cliente.apellido, "Apellido");
                        validarCorreo(cliente.correo);
                        validarTelefono(cliente.telefono, "Teléfono");
                        validarCadena(cliente.direccion, "Dirección");
                        validarOpciones(cliente.estado, "Estado", ["ACTIVO", "INACTIVO", "SUSPENDIDO"]);

                        await service.agregar(cliente);

                        res.writeHead(201);
                        res.end(JSON.stringify({ mensaje: "CLIENTE AGREGADO CORRECTAMENTE" }));
                    } catch (error) {
                        // EVALUA SI ES UN ERROR DE JSON MAL ESCRITO
                        if (error instanceof SyntaxError) {
                            res.writeHead(400);
                            res.end(JSON.stringify({
                                mensaje: "JSON INVÁLIDO: Verifica la sintaxis, comillas o comas faltantes en tu petición."
                            }));
                            return;
                        }

                        res.writeHead(400);
                        res.end(JSON.stringify({ message: (error as Error).message }));
                    }
                });
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO EN ${url}` }));
                return;
            }
        }

        // PUT: Actualizar un cliente existente
        if (url === "/clientes/put") {
            if (metodo === "PUT") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", async () => {
                    try {
                        const cliente = JSON.parse(body);

                        // VALIDACIONES DE ENTRADA PARA ACTUALIZACIÓN
                        validarEntero(cliente.id, "ID");
                        validarTexto(cliente.nombre, "Nombre");
                        validarTexto(cliente.apellido, "Apellido");
                        validarCorreo(cliente.correo);
                        validarTelefono(cliente.telefono, "Teléfono");
                        validarCadena(cliente.direccion, "Dirección");
                        validarOpciones(cliente.estado, "Estado", ["ACTIVO", "INACTIVO", "SUSPENDIDO"]);

                        await service.actualizar(cliente);

                        res.writeHead(200);
                        res.end(JSON.stringify({ mensaje: "CLIENTE ACTUALIZADO CORRECTAMENTE" }));
                    } catch (error) {
                        // EVALUA SI ES UN ERROR DE JSON MAL ESCRITO
                        if (error instanceof SyntaxError) {
                            res.writeHead(400);
                            res.end(JSON.stringify({
                                mensaje: "JSON INVÁLIDO: Verifica la sintaxis, comillas o comas faltantes en tu petición."
                            }));
                            return;
                        }

                        res.writeHead(400);
                        res.end(JSON.stringify({ message: (error as Error).message }));
                    }
                });
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO EN ${url}` }));
                return;
            }
        }

        // GET: Buscar cliente por ID
        if (url.startsWith("/clientes/id/")) {
            if (metodo === "GET") {
                try {
                    const idParam = url.split("/")[3];
                    validarEntero(idParam, "ID de búsqueda");

                    const id = parseInt(idParam);
                    const cliente = await service.buscar(id);

                    if (!cliente) {
                        res.writeHead(404);
                        res.end(JSON.stringify({ mensaje: "CLIENTE NO ENCONTRADO" }));
                        return;
                    }

                    res.writeHead(200);
                    res.end(JSON.stringify(cliente));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: (error as Error).message }));
                }
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO PARA BÚSQUEDA POR ID` }));
                return;
            }
        }

        // GET: Buscar cliente por Correo
        if (url.startsWith("/clientes/correo/")) {
            if (metodo === "GET") {
                try {
                    const correo = url.split("/")[3];
                    validarCorreo(correo);

                    const cliente = await service.buscarPorCorreo(correo);

                    if (!cliente) {
                        res.writeHead(404);
                        res.end(JSON.stringify({ mensaje: "CLIENTE NO ENCONTRADO" }));
                        return;
                    }

                    res.writeHead(200);
                    res.end(JSON.stringify(cliente));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: (error as Error).message }));
                }
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO PARA BÚSQUEDA POR CORREO` }));
                return;
            }
        }

        // DELETE: Eliminar cliente por ID
        if (url.startsWith("/clientes/delete/")) {
            if (metodo === "DELETE") {
                try {
                    const idParam = url.split("/")[3];
                    validarEntero(idParam, "ID para eliminar");

                    const id = parseInt(idParam);
                    await service.eliminar(id);

                    res.writeHead(200);
                    res.end(JSON.stringify({ mensaje: "CLIENTE ELIMINADO CORRECTAMENTE" }));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: (error as Error).message }));
                }
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO PARA ELIMINAR` }));
                return;
            }
        }

        // RUTA INEXISTENTE DENTRO DE /clientes
        res.writeHead(404);
        res.end(JSON.stringify({ mensaje: "RUTA NO ENCONTRADA" }));

    } catch (error) {
        // ERROR INESPERADO DEL SERVIDOR
        res.writeHead(500);
        res.end(JSON.stringify({
            mensaje: (error as Error).message
        }));
    }
}