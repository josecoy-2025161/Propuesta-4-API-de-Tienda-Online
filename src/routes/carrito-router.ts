import { IncomingMessage, ServerResponse } from "node:http";
import { CarritoService } from "../service/CarritoService";
import { validarEntero } from "../utils/Validaciones";

const service = new CarritoService();

export async function routerCarrito(req: IncomingMessage, res: ServerResponse) {
    res.setHeader("Content-type", "application/json");

    const url = req.url ?? "";
    const metodo = req.method ?? "";

    try {
        // GET: Listar todos los carritos
        if (url === "/carritos") {
            if (metodo === "GET") {
                const carritos = await service.listar();
                res.writeHead(200);
                res.end(JSON.stringify(carritos));
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO EN ${url}` }));
                return;
            }
        }

        // POST: Crear un nuevo carrito (Requiere clienteId)
        if (url === "/carritos/crear") {
            if (metodo === "POST") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", async () => {
                    try {
                        const peticion = JSON.parse(body);

                        // Necesitamos el ID del cliente para abrir un carrito
                        validarEntero(peticion.clienteId, "clienteId");

                        // Inicializa el ID, items vacíos, total 0 y estado "ACTIVO"
                        const nuevoCarrito = await service.crear(peticion.clienteId);

                        res.writeHead(201);
                        res.end(JSON.stringify({
                            mensaje: "CARRITO CREADO CORRECTAMENTE",
                            carrito: nuevoCarrito
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

        // POST: Agregar un ítem a un carrito activo
        if (url === "/carritos/agregar-item") {
            if (metodo === "POST") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk;
                });

                req.on("end", async () => {
                    try {
                        const peticion = JSON.parse(body);

                        // Validaciones de los datos recibidos
                        validarEntero(peticion.carritoId, "carritoId");
                        validarEntero(peticion.productoId, "productoId");
                        validarEntero(peticion.cantidad, "cantidad");

                        // Validar que la cantidad a agregar no sea cero
                        if (peticion.cantidad <= 0) {
                            throw new Error("LA CANTIDAD A AGREGAR DEBE SER MAYOR A CERO");
                        }

                        // ItemCarrito
                        const item = {
                            productoId: peticion.productoId,
                            cantidad: peticion.cantidad
                        };

                        await service.agregarItem(peticion.carritoId, item);

                        res.writeHead(200);
                        res.end(JSON.stringify({ mensaje: "ÍTEM AGREGADO CORRECTAMENTE AL CARRITO" }));
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

        // RUTA NO ENCONTRADA PARA CARRITOS
        res.writeHead(404);
        res.end(JSON.stringify({ mensaje: "RUTA DE CARRITOS NO ENCONTRADA" }));

    } catch (error) {
        // ERROR INTERNO
        res.writeHead(500);
        res.end(JSON.stringify({
            mensaje: "ERROR INTERNO DEL SERVIDOR",
            detalle: (error as Error).message
        }));
    }
}