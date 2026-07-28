import { IncomingMessage, ServerResponse } from "node:http";
import { ProductoService } from "../service/ProductoService";
import {
    validarEntero,
    validarCadena,
    validarNumeroPositivo,
    validarOpciones
} from "../utils/Validaciones";

const service = new ProductoService();

export async function routerProducto(req: IncomingMessage, res: ServerResponse) {
    res.setHeader("Content-type", "application/json");

    const url = req.url ?? "";
    const metodo = req.method ?? "";

    try {
        // GET: Listar todos los productos
        if (url === "/productos") {
            if (metodo === "GET") {
                const productos = await service.listar();
                res.writeHead(200);
                res.end(JSON.stringify(productos));
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO EN ${url}` }));
                return;
            }
        }

        // POST: Agregar un nuevo producto
        if (url === "/productos/post") {
            if (metodo === "POST") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", async () => {
                    try {
                        const producto = JSON.parse(body);

                        // VALIDACIONES DE ENTRADA PARA PRODUCTO
                        validarEntero(producto.id, "ID");
                        validarCadena(producto.nombre, "Nombre");
                        validarCadena(producto.descripcion, "Descripción");
                        validarNumeroPositivo(producto.precio, "Precio");
                        validarEntero(producto.stock, "Stock");

                        validarOpciones(producto.categoria, "Categoría", ["ELECTRONICA", "ROPA", "HOGAR", "JUGUETES", "ALIMENTOS"]);
                        validarOpciones(producto.estado, "Estado", ["DISPONIBLE", "AGOTADO", "DESCONTINUADO"]);

                        await service.agregar(producto);

                        res.writeHead(201);
                        res.end(JSON.stringify({ mensaje: "PRODUCTO AGREGADO CORRECTAMENTE" }));
                    } catch (error) {
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

        // PUT: Actualizar un producto existente
        if (url === "/productos/put") {
            if (metodo === "PUT") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", async () => {
                    try {
                        const producto = JSON.parse(body);

                        // VALIDACIONES DE ENTRADA PARA ACTUALIZACIÓN
                        validarEntero(producto.id, "ID");
                        validarCadena(producto.nombre, "Nombre");
                        validarCadena(producto.descripcion, "Descripción");
                        validarNumeroPositivo(producto.precio, "Precio");
                        validarEntero(producto.stock, "Stock");

                        validarOpciones(producto.categoria, "Categoría", ["ELECTRONICA", "ROPA", "HOGAR", "JUGUETES", "ALIMENTOS"]);
                        validarOpciones(producto.estado, "Estado", ["DISPONIBLE", "AGOTADO", "DESCONTINUADO"]);

                        await service.actualizar(producto);

                        res.writeHead(200);
                        res.end(JSON.stringify({ mensaje: "PRODUCTO ACTUALIZADO CORRECTAMENTE" }));
                    } catch (error) {
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

        // GET: Buscar producto por ID
        if (url.startsWith("/productos/id/")) {
            if (metodo === "GET") {
                try {
                    const idParam = url.split("/")[3];
                    validarEntero(idParam, "ID de búsqueda");

                    const id = parseInt(idParam);
                    const producto = await service.buscar(id);

                    if (!producto) {
                        res.writeHead(404);
                        res.end(JSON.stringify({ mensaje: "PRODUCTO NO ENCONTRADO" }));
                        return;
                    }

                    res.writeHead(200);
                    res.end(JSON.stringify(producto));
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

        // DELETE: Eliminar producto por ID
        if (url.startsWith("/productos/delete/")) {
            if (metodo === "DELETE") {
                try {
                    const idParam = url.split("/")[3];
                    validarEntero(idParam, "ID para eliminar");

                    const id = parseInt(idParam);
                    await service.eliminar(id);

                    res.writeHead(200);
                    res.end(JSON.stringify({ mensaje: "PRODUCTO ELIMINADO CORRECTAMENTE" }));
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

        // RUTA INEXISTENTE DENTRO DE /productos
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