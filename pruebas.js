const tienda = require('./problema.js'); 

console.log("==================================================");
console.log("  REPORTE DE PRUEBAS COMPLETAS - GRUPO 4");
console.log("==================================================\n");

console.log("--------------------------------------------------");
console.log(" PARTE 1: PRUEBAS UNITARIAS (Funciones Aisladas)");
console.log("--------------------------------------------------\n");

// --- UNITARIA 1: searchProducts ---

console.log("Prueba Unitaria 1: searchProducts (Buscador)");

const resultadoBusqueda = tienda.searchProducts(tienda.dbProducts, { searchText: "laptop", minPrice: 0, maxPrice: 1500000 });

console.log("Esperado: Encontrar 1 producto ('Laptop Pro 15').");
console.log("Estado:", resultadoBusqueda.length === 1 ? "PASÓ\n" : "FALLÓ\n");
console.log(resultadoBusqueda);
console.log("");

    //Subprueba B: busqueda sin resultados
const busquedaVacia = tienda.searchProducts(tienda.dbProducts, { searchText: "procesador i9", minPrice: 0, maxPrice: 1500000 });

console.log("Esperado B (Negativo): No debe encontrar productos y devolver arreglo vacío.");
console.log("Estado B:", busquedaVacia.length === 0 ? "PASÓ\n" : "FALLÓ\n");
console.log(busquedaVacia);
console.log("");


// --- UNITARIA 2: cupon ---

console.log("Prueba Unitaria 2: cupon (Sistema de Descuentos)");

// Simulamos un carrito de 60.000 para usar el cupon DESC10 (10% dcto, min 50.000)
const resultadoCupon = tienda.cupon("DESC10", 1, 60000, tienda.dbProducts);

console.log("Esperado: El descuento debe ser de $6000.");
console.log("Estado:", resultadoCupon.descuento === 6000 ? "PASÓ\n" : "FALLÓ\n");
console.log(resultadoCupon);
console.log("");

    //subprueba B: compra menor al minimo permitido

// El cupon DESC10 exige $50.000 minimo. simulamos un carrito de $10.000
const cuponRechazado = tienda.cupon("DESC10", 1, 10000, tienda.dbProducts);

console.log("Esperado B (Negativo): El cupón debe ser rechazado por no cumplir el mínimo.");
console.log("Estado B:", cuponRechazado.ok === false && cuponRechazado.descuento === 0 ? "PASÓ\n" : "FALLÓ\n");
console.log(cuponRechazado);
console.log("");


// --- UNITARIA 3: calcShipping ---

console.log("Prueba Unitaria 3: calcShipping (Cálculo de Envíos)");
//parametros: destCity, weight, dimensions, prodType, isUrgent, isFree, hasInsurance

//subprueba A: Envio gratis
const envioGratis = tienda.calcShipping("Santiago", 5, null, "normal", false, true, false);

console.log("Esperado A: El costo debe ser 0 si tiene etiqueta de 'envío gratis'.");
console.log("Estado A:", envioGratis.costo === 0 ? "PASÓ\n" : "FALLÓ\n");
console.log(envioGratis);
console.log("\n");

    //subprueba B: Matematica de Envios a Regiones Extremas

//Punta Arenas multiplica x 2.5. paquete de 2kg cuesta base $3500 (3500 * 2.5 = 8750)
const envioPuntaArenas = tienda.calcShipping("Punta Arenas", 2, null, "normal", false, false, false);

console.log("Esperado B: Envío a Punta Arenas de 2kg debe calcular $8750.");
console.log("Estado B:", envioPuntaArenas.costo === 8750 ? "PASÓ\n" : "FALLÓ\n");
console.log(envioPuntaArenas);
console.log("\n");



console.log("--------------------------------------------------");
console.log(" PARTE 2: PRUEBAS DE INTEGRACIÓN (Flujos Completos)");
console.log("--------------------------------------------------\n");

// --- INTEGRACIÓN 1: Flujo de Login ---

console.log("Prueba Integracion 1: doEverything -> Login");

tienda.doEverything('login', { email: "juan@mail.com", password: "1234" }, (resultadoLogin) => {
    console.log("Esperado: Acceso permitido con credenciales correctas.");
    console.log("Estado:", resultadoLogin.ok === true ? "PASÓ\n" : "FALLÓ\n");
    console.log(resultadoLogin);
});
console.log("");

    //Caso B: Login Fallido (Contraseña Incorrecta) ---
console.log("Prueba doEverything -> Login (Error de clave)");

const credencialesErroneas = { email: "juan@mail.com", password: "nomeacuerdodelaclave" };

tienda.doEverything('login', credencialesErroneas, (resultado) => {
    console.log("Esperado B (Negativo): El acceso debe ser denegado (ok: false).");
    console.log("Obtenido:", resultado.ok ? "ERROR: Permitio el acceso\n" : "EXITO: Acceso Denegado\n");
    console.log(resultado);
});
console.log("\n");



// --- INTEGRACIÓN 2 - CASO A: Búsqueda Exitosa ---

console.log("Prueba Integracion 2: doEverything -> buscarProductos");

const payloadBusquedaExito = { category: "electronica", minPrice: 0, maxPrice: 1500000 };

tienda.doEverything('buscarProductos', payloadBusquedaExito, (resultado) => {
    console.log("Esperado A: La solicitud debe ser exitosa y 2 productos.");
    
    // Verificamos que la respuesta del servidor sea ok y traiga datos
    const exito = resultado.ok === true;
    const cantidad = resultado.data ? resultado.data.length : 0;
    
    console.log("Obtenido: Solicitud", exito ? "Exitosa" : "Fallida", "| Productos encontrados:", cantidad);
    console.log("Estado A:", (exito && cantidad >= 1) ? "PASÓ\n" : "FALLÓ\n");
    console.log(resultado);
});
console.log("");



    //Caso B: Búsqueda Sin Resultados  ---
console.log("Prueba Integracion 2-B: doEverything -> buscarProductos (Busqueda vacia)");

const payloadBusquedaVacia = { category: "videojuegos", minPrice: 0, maxPrice: 100 };

tienda.doEverything('buscarProductos', payloadBusquedaVacia, (resultado) => {
    console.log("Esperado B (Negativo): La solicitud funciona, pero devuelve 0 productos.");
    
    const exito = resultado.ok === true; // La petición en sí no falla, solo no hay datos
    const cantidad = resultado.data ? resultado.data.length : 0;
    
    console.log("Obtenido: Solicitud", exito ? "Exitosa" : "Fallida", "| Productos encontrados:", cantidad);
    console.log("Estado B:", (exito && cantidad === 0) ? "PASÓ\n" : "FALLÓ\n");
    console.log(resultado);
});
console.log("\n");