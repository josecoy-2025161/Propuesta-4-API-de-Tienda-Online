import { ClienteRepository } from "../data/ClienteRepository";
import { Cliente } from '../models/Cliente';

export class ClienteService {
    repository = new ClienteRepository();

    // Metodo para obtener clientes
    listar = async (): Promise<Cliente[]> => {
        return await this.repository.obtenerClientes();
    };

    // Metodo para agregarClientes | actualizar | eliminar
    agregar = async (cliente: Cliente): Promise<void> => {
        const clientes = await this.repository.obtenerClientes();

        const existeId = clientes.some(c => c.id === cliente.id);
        if (existeId) {
            throw new Error("YA EXISTE UN CLIENTE CON ESE ID");
        }

        // Validacion: Correo unico
        const existeCorreo = clientes.some(c => c.correo === cliente.correo);
        if (existeCorreo) {
            throw new Error("YA EXISTE UN CLIENTE REGISTRADO CON ESE CORREO");
        }

        clientes.push(cliente);
        await this.repository.guardarClientes(clientes);
    };

    // Metodo para buscar por ID
    buscar = async (id: number): Promise<Cliente | undefined> => {
        const clientes = await this.repository.obtenerClientes();
        return clientes.find(c => c.id === id);
    };

    // Metodo para buscar por correo
    buscarPorCorreo = async (correo: string): Promise<Cliente | undefined> => {
        const clientes = await this.repository.obtenerClientes();
        return clientes.find(c => c.correo === correo);
    };

    // Metodo para actualizar
    actualizar = async (cliente: Cliente): Promise<void> => {
        const clientes = await this.repository.obtenerClientes();
        const indice = clientes.findIndex(c => c.id === cliente.id);

        if (indice === -1) {
            throw new Error("CLIENTE NO EXISTE");
        }

        // Validar que el nuevo correo no le pertenezca a otro cliente diferente
        const existeCorreo = clientes.some(c => c.correo === cliente.correo && c.id !== cliente.id);
        if (existeCorreo) {
            throw new Error("EL NUEVO CORREO YA ESTA EN USO POR OTRO CLIENTE");
        }

        clientes[indice] = cliente;
        await this.repository.guardarClientes(clientes);
    };

    // Metodo para eliminar
    eliminar = async (id: number): Promise<void> => {
        const clientes = await this.repository.obtenerClientes();
        const nuevos = clientes.filter(c => c.id !== id);

        if (nuevos.length === clientes.length) {
            throw new Error("EL CLIENTE NO EXISTE");
        }

        await this.repository.guardarClientes(nuevos);
    };
}