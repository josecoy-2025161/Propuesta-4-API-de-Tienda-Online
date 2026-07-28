import { CuponRepository } from "../data/CuponRepository";
import { Cupon } from "../models/Cupon";

export class CuponService {
    repository = new CuponRepository();

    // Metodo para listar cupones
    listar = async (): Promise<Cupon[]> => {
        return await this.repository.obtenerCupones();
    };

    // Metodo para agregar un cupon nuevo
    agregar = async (cupon: Cupon): Promise<void> => {
        const cupones = await this.repository.obtenerCupones();

        // Validar que el código no se repita
        const existeCodigo = cupones.some(c => c.codigo === cupon.codigo);
        if (existeCodigo) {
            throw new Error("YA EXISTE UN CUPON CON ESE CODIGO");
        }

        cupones.push(cupon);
        await this.repository.guardarCupones(cupones);
    };

    // Metodo para buscar por código
    buscarPorCodigo = async (codigo: string): Promise<Cupon | undefined> => {
        const cupones = await this.repository.obtenerCupones();
        return cupones.find(c => c.codigo === codigo);
    };

    // Metodo para eliminar un cupon
    eliminar = async (id: number): Promise<void> => {
        const cupones = await this.repository.obtenerCupones();
        const nuevos = cupones.filter(c => c.id !== id);

        if (nuevos.length === cupones.length) {
            throw new Error("EL CUPON NO EXISTE");
        }

        await this.repository.guardarCupones(nuevos);
    };
}