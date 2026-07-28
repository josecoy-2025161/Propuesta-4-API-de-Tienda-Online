import { IncomingMessage, ServerResponse } from "node:http";
import { ReporteService } from "../service/ReporteService";

const service = new ReporteService();

export async function routerReporte(req: IncomingMessage, res: ServerResponse) {
    res.setHeader("Content-type", "application/json");

    const url = req.url ?? "";
    const metodo = req.method ?? "";

    try {
        // GET: Recomendar productos (Top 5 más vendidos)
        if (url === "/reportes/recomendaciones") {
            if (metodo === "GET") {
                const recomendaciones = await service.recomendarProductos();
                res.writeHead(200);
                res.end(JSON.stringify({
                    mensaje: "TOP 5 PRODUCTOS RECOMENDADOS",
                    recomendaciones: recomendaciones
                }));
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO EN ${url}` }));
                return;
            }
        }

        // GET: Reporte de ingresos totales
        if (url === "/reportes/ingresos") {
            if (metodo === "GET") {
                const ingresos = await service.reporteIngresosTotales();
                res.writeHead(200);
                res.end(JSON.stringify({
                    mensaje: "REPORTE DE INGRESOS GENERADO",
                    ingresosTotales: ingresos
                }));
                return;
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ mensaje: `MÉTODO ${metodo} NO PERMITIDO EN ${url}` }));
                return;
            }
        }

        // RUTA NO ENCONTRADA PARA REPORTES
        res.writeHead(404);
        res.end(JSON.stringify({ mensaje: "RUTA DE REPORTES NO ENCONTRADA" }));

    } catch (error) {
        // ERROR INTERNO
        res.writeHead(500);
        res.end(JSON.stringify({
            mensaje: "ERROR INTERNO DEL SERVIDOR",
            detalle: (error as Error).message
        }));
    }
}