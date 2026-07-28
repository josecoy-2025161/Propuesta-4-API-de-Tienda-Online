// Validar que el campo no esté vacío 
export const validarCadena = (valor: string, campo: string): void => {
    if (!valor || valor.trim() === "") {
        throw new Error(`El campo ${campo} no puede estar vacío.`);
    }
};

// Validar que solo contenga texto 
export const validarTexto = (valor: string, campo: string): void => {
    validarCadena(valor, campo);
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!regex.test(valor)) {
        throw new Error(`El campo ${campo} solo acepta letras y espacios.`);
    }
};

// Validar correos específicos (GMAIL, OUTLOOK, HOTMAIL)
export const validarCorreo = (valor: string): void => {
    validarCadena(valor, "Correo");
    const dominiosValidos = ["@gmail.com", "@outlook.com", "@hotmail.com"];
    const correoMinusculas = valor.trim().toLowerCase();

    const esValido = dominiosValidos.some(dominio => correoMinusculas.endsWith(dominio));
    if (!esValido) {
        throw new Error(`Solo se aceptan correos que terminen en: ${dominiosValidos.join(", ")}`);
    }
};

// Validar números enteros y no negativos 
export const validarEntero = (valor: any, campo: string): void => {
    if (valor === undefined || valor === null || valor === "") {
        throw new Error(`El campo ${campo} no puede estar vacío.`);
    }

    const numero = Number(valor);
    if (isNaN(numero) || !Number.isInteger(numero) || numero < 0) {
        throw new Error(`El campo ${campo} debe ser un número entero válido y no negativo.`);
    }
};

// Validar números decimales o enteros no negativos 
export const validarNumeroPositivo = (valor: any, campo: string): void => {
    if (valor === undefined || valor === null || valor === "") {
        throw new Error(`El campo ${campo} no puede estar vacío.`);
    }

    const numero = Number(valor);

    if (isNaN(numero) || numero < 0) {
        throw new Error(`El campo ${campo} debe ser un número válido (puede llevar decimales) y no negativo.`);
    }
};

// Validar Types correctos
export const validarOpciones = (valor: string, campo: string, opcionesValidas: string[]): void => {
    validarCadena(valor, campo);
    const opcionesMayusculas = opcionesValidas.map(op => op.toUpperCase());

    if (!opcionesMayusculas.includes(valor.trim().toUpperCase())) {
        throw new Error(`El campo ${campo} es inválido. Opciones permitidas: ${opcionesValidas.join(", ")}`);
    }
};

// Validar que un número de teléfono tenga al menos 8 dígitos
export const validarTelefono = (valor: any, campo: string): void => {
    validarEntero(valor, campo); 
    const telefonoStr = String(valor);
    if (telefonoStr.length < 8) {
        throw new Error(`El campo ${campo} debe tener al menos 8 dígitos.`);
    }
};

// Validar que un arreglo no esté vacío (ej. items del carrito)
export const validarArregloNoVacio = (arreglo: any[], campo: string): void => {
    if (!Array.isArray(arreglo) || arreglo.length === 0) {
        throw new Error(`El campo ${campo} debe ser una lista válida y contener al menos un elemento.`);
    }
};