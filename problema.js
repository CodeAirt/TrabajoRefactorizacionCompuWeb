// sistema de gestion de tienda online
// hecho por: grupo 4 

var x = [];
const DESCUENTO = 10;
const DESCUENTO2 = 20;
const DESCUENTO3 = 5;
const flag = false;
const temp = null;
const c = 0;
var result;


var aux;


var currentU;
var sessData;

var myCart = [];
var myCart2 = [];
var totalVar = 0;

var i = 0;

var j = 0;

var q = null;

var response;

var err;

function doEverything(u, p2, action, dat, extraDat, moreData, flag99, cb) {


  let isOk = false;
  let msg = "";
  let tempUser = null;

  const dbUsers = [
    { id: 1, nombre: "Juan Perez", email: "juan@mail.com", pass: "1234", tipo: "admin", puntos: 150, descuento: 0, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: true, intentos: 0, bloqueado: false, ultimoLogin: null, createdAt: "2023-01-01", updatedAt: "2023-06-01" },
    { id: 2, nombre: "Maria Lopez", email: "maria@mail.com", pass: "abcd", tipo: "cliente", puntos: 80, descuento: 5, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: true, intentos: 0, bloqueado: false, ultimoLogin: null, createdAt: "2023-02-01", updatedAt: "2023-06-15" },
    { id: 3, nombre: "Pedro Gonzalez", email: "pedro@mail.com", pass: "pass123", tipo: "vendedor", puntos: 200, descuento: 10, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: true, intentos: 0, bloqueado: false, ultimoLogin: null, createdAt: "2023-03-01", updatedAt: "2023-07-01" },
    { id: 4, nombre: "Ana Martinez", email: "ana@mail.com", pass: "ana2024", tipo: "cliente", puntos: 50, descuento: 0, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: false, intentos: 3, bloqueado: true, ultimoLogin: null, createdAt: "2023-04-01", updatedAt: "2023-07-10" },
    { id: 5, nombre: "Carlos Ruiz", email: "carlos@mail.com", pass: "carlos99", tipo: "cliente", puntos: 300, descuento: 15, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: true, intentos: 0, bloqueado: false, ultimoLogin: null, createdAt: "2023-05-01", updatedAt: "2023-08-01" }
  ];

  const dbProducts = [/* igual que antes */];

  
  if (action === "login") {

    //buscar usuario (más limpio)
    for (let i = 0; i < dbUsers.length; i++) {
      if (dbUsers[i].email === u && dbUsers[i].pass === p2) {
        tempUser = dbUsers[i];
        isOk = true;
        break;
      }
    }

    
    if (isOk) {

      // validaciones simplificadas (early return)
      if (tempUser.bloqueado) {
        return cb({ ok: false, msg: "usuario bloqueado", data: null });
      }

      if (!tempUser.activo) {
        return cb({ ok: false, msg: "usuario inactivo", data: null });
      }

   
      let nivel = "bronce";

      if (tempUser.puntos >= 300) {
        nivel = "platino";
      } else if (tempUser.puntos >= 200) {
        nivel = "oro";
      } else if (tempUser.puntos >= 100) {
        nivel = "plata";
      }

      tempUser.nivel = nivel;
      tempUser.ultimoLogin = new Date().toISOString();

     
      sessData = {
        user: tempUser,
        token: "tkn_" + Math.random().toString(36).substr(2, 9),
        loginTime: new Date()
      };

      currentU = tempUser;

      return cb({ ok: true, msg: "login ok", data: sessData });

    } else {

      // manejo de intentos fallidos optimizado
      for (let i = 0; i < dbUsers.length; i++) {
        if (dbUsers[i].email === u) {
          dbUsers[i].intentos++;

          if (dbUsers[i].intentos >= 3) {
            dbUsers[i].bloqueado = true;
          }
          break;
        }
      }

      return cb({ ok: false, msg: "credenciales invalidas", data: null });
    }
  }


  if (action === "buscarProductos"){
    var res = searchProducts(dbProducts, {
      product: dat,
      category: extraDat,
      minPrice: moreData ? moreData.min : 0,
      maxPrice: moreData ? moreData.max : 999999999
    });

    cb({ ok: true, msg: "ok", data: res });
    return;
  }
}


  // buscar productos (mas a delante sacar y dejar solo la funcion)(ejemplo de entrada de variables de la funcion search)
  if (action === "buscarProductos"){
    var res = searchProducts(dbProducts, {
      product: dat,
      category: extraDat,
      minPrice: moreData ? moreData.min : 0,
      maxPrice: moreData ? moreData.max : 999999999
    });

    cb({ ok: true, msg: "ok", data: res });
    return;
  }

  //funcion de filtro por texto
function matchQuery(prod, query) {
  if (!query || query == "" || query == null || query == undefined) {
    return true;
  }

  if (prod.nom.toLowerCase().indexOf(query.toLowerCase()) != -1) {
    return true;
  }

  if (prod.desc.toLowerCase().indexOf(query.toLowerCase()) != -1) {
    return true;
  }

  for (var j = 0; j < prod.tags.length; j++) {
    if (prod.tags[j].toLowerCase().indexOf(query.toLowerCase()) != -1) {
      return true;
    }
  }

  return false;
}


//funcion fltro por categoria
function matchCategoria(prod, cat) {
  if (!cat || cat == "" || cat == null || cat == undefined) {
    return true;
  }

  return prod.cat == cat;
}


//fincion filtro por precio
function matchPrecio(prod, minP, maxP) {
  if (prod.prec < minP || prod.prec > maxP) {
    return false;
  }
  return true;
}


// funcion de ordenamiento
function sortByRating(res) {
  for (var i = 0; i < res.length - 1; i++) {
    for (var j = 0; j < res.length - i - 1; j++) {
      if (res[j].rating < res[j + 1].rating) {
        var tmp = res[j];
        res[j] = res[j + 1];
        res[j + 1] = tmp;
      }
    }
  }
}


//funcion de busqueda de productos (sin optimizar ni nada)
function searchProducts(products, filters) {
  var productKeyword = filters && filters.product ? filters.product : null;
  var category = filters && filters.category ? filters.category : null;
  var minPrice = filters && filters.minPrice ? filters.minPrice : 0;
  var maxPrice = filters && filters.maxPrice ? filters.maxPrice : 999999999;

  var results = [];

  for (var i = 0; i < products.length; i++){
    var currentProduct = products[i];

    if (!currentProduct.activo) continue; //si el producto no esta activo, salta al siguiente en la lista dentro del for [i+1]

    if(matchQuery(currentProduct, productKeyword) && matchCategoria(currentProduct, category) && matchPrecio(currentProduct, minPrice, maxPrice)) {
      results.push(currentProduct);
    }
  }

  sortByRating(results);

  return results;
}




// Funcion carro
  function BuscarProducto(productos, id){
    for(let i=0; i<productos.length; i++){
        if(productos[i].id==id){
            return productos[i];
        }
    }
    return false;
}
function BuscarUsuario(usuarios, id){
    for(let i=0; i<usuarios.length; i++){
        if(usuarios[i].id==id){
            return usuarios[i];
        }
    }
    return false;
}
function AgregarAlCarrito(usuario, prodId, cantidad){
    let existe=false;
    for(let i=0; i<usuario.carrito.length; i++){
        if(usuario.carrito[i].prodId==prodId){
            usuario.carrito[i].cantidad+=cantidad;
            existe=true;
            break;
        }
    }
    if(existe==false){
        usuario.carrito.push({
            prodId: prodId,
            cantidad: cantidad,
            addedAt: new Date()
        });
    }
}
function CalcularTotalCarrito(carrito, productos){
    let total=0;
    for(let i=0; i<carrito.length; i++){
        for(let j=0; j<productos.length; j++){
            if(productos[j].id==carrito[i].prodId){
                total+=productos[j].prec*carrito[i].cantidad;
                break;
            }
        }
    }
    return total;
}
function AddCart(dbProducts, dbUsers, prodId, cantidad, userId, cb){
    const producto=BuscarProducto(dbProducts, prodId);
    const usuario=BuscarUsuario(dbUsers, userId);
    if(producto==false){
        cb({ok:false, msg:"producto no encontrado", data:false});
        return;
    }
    if(producto.activo==false){
        cb({ok:false, msg:"producto no disponible", data:false});
        return;
    }
    if(producto.stock<cantidad){
        cb({ok:false, msg:"stock insuficiente", data:false});
        return;
    }
    if(usuario==false){
        cb({ok:false, msg:"usuario no encontrado", data:false});
        return;
    }
    AgregarAlCarrito(usuario, prodId, cantidad);
    const total=CalcularTotalCarrito(usuario.carrito, dbProducts);
    cb({
        ok:true,
        msg:"producto agregado al carrito",
        data:{carrito:usuario.carrito, total:total}
    });
}
function CalcularItemsYSubtotal(carrito, productos){
    let subtotal=0;
    let items=[];
    for(let i=0; i<carrito.length; i++){
        for(let j=0; j<productos.length; j++){
            if(productos[j].id==carrito[i].prodId){
                const totalItem=productos[j].prec*carrito[i].cantidad;
                subtotal+=totalItem;
                items.push({
                    prod: productos[j].nom,
                    cantidad: carrito[i].cantidad,
                    precUnit: productos[j].prec,
                    totalItem: totalItem
                });
                break;
            }
        }
    }
    return {subtotal:subtotal, items:items};
}
function CalcularTotales(subtotal, descuento){
    const descuentoMonto=subtotal*(descuento/100);
    const totalSinIva=subtotal-descuentoMonto;
    const iva=totalSinIva*0.19;
    const totalFinal=totalSinIva+iva;
    return {
        descuentoMonto:descuentoMonto, totalSinIva:totalSinIva, iva:iva, totalFinal:totalFinal
    };
}
function CrearOrden(userId, items, subtotal, descuento, totales, metodoPago, direccion, puntosGanados){
    return {
        id:"ORD-"+Date.now(), userId:userId, items:items, subtotal:subtotal, descuentoPct:descuento, descuentoMonto:totales.descuentoMonto,
        totalSinIva:totales.totalSinIva, iva:totales.iva, total:totales.totalFinal, metodoPago:metodoPago, direccion:direccion, estado:"pendiente", puntosGanados:puntosGanados,
        createdAt:new Date()
    };
}
// Funcion de actualizar el stock
function ActualizarStock(carro, productos){
    for(let i=0; i<carro.length; i++){
        const objetoCarrito=carro[i];
        for(let j=0; j<productos.length; j++){
            const producto=productos[j];
            if(producto.id==objetoCarrito.prodId){
                producto.stock-=objetoCarrito.cantidad;
                break;
            }
        }
    }
}
function PuntosUsuario(usuario, puntitos){
    usuario.puntos+=puntitos;
}
function LimpiarCarrito(usuario){
    usuario.carrito=[];
}
function AgregarAlHistorial (usuario, laorden){
    usuario.historial.push(laorden);
}

function ProcesoDelPago(metododepago, datostarjeta){
    if(metododepago=="tarjeta"){
        if(ValidarTarjeta(datostarjeta)==false){
            return{ok:false, msg:"datos de tarjeta invalidos", data:false};
        }
        return{ok: true};
    }
    if(metododepago=="transferencia"|| metododepago=="efectivo"){
        return{ok: true};
    }
    return{ok:false, msg:"metodo de pago no valido", data:false};
}
function ValidarTarjeta(datostarjeta){
    if(datostarjeta==false){
        return false;
    }
    if(datostarjeta.numero=="" || datostarjeta.numero.length!=16){
        return false;
    }
    if(datostarjeta.cvv==""||datostarjeta.cvv.length!=3){
        return false;
    }
    return true;
}
  function GetStats(usuarios, productos){
    const StatsUsuarios=getstatsUsuarios(usuarios);
    const StatsProductos=getstatsProductos(productos);
    return {usuarios:StatsUsuarios, productos:StatsProductos};
}
function getstatsUsuarios(usuarios){
    let total=0;
    let activos=0;
    let bloqueados=0;
    let admin=0;
    let clientes=0;
    let vendedores=0;
    for (let i=0; i<usuarios.length; i++){
        const people=usuarios[i];
        total++;
        if (people.activo==true){
            activos++;
        }
        if (people.bloqueado==true){
            bloqueados++;
        }
        if (people.tipo=="admin"){
            admin++;
        }
        if (people.tipo=="cliente"){
            clientes++;
        }
        if (people.tipo=="vendedor"){
           vendedores++; 
        }
    }
    return {
        total:total, activos:activos, bloqueados:bloqueados, admin:admin, clientes:clientes, vendedores:vendedores
    };
}
function getstatsProductos(productos){
    let total=0;
    let activos=0;
    let inactivos=0;
    let electronica=0;
    let accesorios=0;
    let audio=0;
    let almacenamiento=0;
    let componentes=0;
    let muebles=0;
    let totalstock=0;
    let PrecioInventario=0;
    for (let i=0; i<productos.length; i++){
        const product=productos[i]; //product asi bien english (me estoy quedando sin nombrescabron)
        total++;
        if(product.activo==true){
            activos++;
        }
        if(product.activo==false){
            inactivos++;
        }
        if(product.cat=="electronica"){
            electronica++;
        }
        if(product.cat=="accesorios"){
            accesorios++;
        }
        if(product.cat=="audio"){
            audio++;
        }
        if(product.cat=="almacenamiento"){
            almacenamiento++;
        }
        if(product.cat=="componentes"){
            componentes++;
        }
        if(product.cat=="muebles"){
            muebles++;
        }
        totalstock+=product.stock;
        PrecioInventario+=product.prec*product.stock;
    }
    return {
        total:total, activos:activos, inactivos:inactivos, porCategoria:{
            electronica:electronica, accesorios:accesorios, audio:audio, almacenamiento:almacenamiento, componentes:componentes, muebles:muebles
        }, totalstock:totalstock, PrecioInventario:PrecioInventario
    };
}

function CalculoDePrecio(precioOG, Desc1, Desc2, Desc3, AplicaIVA, CostoEnvio, cuotas) {
    let precio=precioOG;
    precio=AplicarDescuento(precio, Desc1);
    precio=AplicarDescuento(precio, Desc2);
    precio=AplicarDescuento(precio, Desc3);
    const subtotal=precio;
    if (AplicaIVA==true) {
        precio=AplicarIVA(precio);
    }
    precio+=CostoEnvio;
    const PrecioTotal=AplicarInteresOCuotas(precio, cuotas);
    return {
        base:precioOG, subtotal:subtotal, envio:CostoEnvio, total:PrecioTotal, CuotaTotal:cuotas>1? PrecioTotal/cuotas:PrecioTotal
    };
}
function AplicarDescuento(precio, descuento) {
    if (descuento>0) {
        return precio-(precio*(descuento/100));
    }
    return precio;
}
function AplicarIVA(precio) {
    return precio+(precio*0.19);
}
function AplicarInteresOCuotas(precio, cuotas) {
    let interes=0;
    if (cuotas==2){
        interes=0.02;
    }
    if (cuotas==3){
        interes=0.04;
    }
    if (cuotas==6){
        interes=0.08;
    }
    if (cuotas==12){
        interes=0.15;
    }
    if (cuotas==24){
        interes=0.28;
    }
    if (cuotas==36){
        interes=0.45;
    }
    if (cuotas>1) {
        return precio+(precio*interes);
    }
    return precio;
}
function Checkout(foundUser2, dbProducts, metodoPago, flag99, puntosGanados, orden, cb) {
    const ResultadoDelPrecio=CalculoDePrecio(orden.precioOG, orden.Desc1, orden.Desc2, orden.Desc3, true, orden.envio, orden.cuotas);
    orden.total=ResultadoDelPrecio.total;
    const ResultadoDelPago=ProcesoDelPago(metodoPago, flag99);
    if (ResultadoDelPago.ok==false) {
        cb(ResultadoDelPago);
        return;
    }
    ActualizarStock(foundUser2.carrito, dbProducts);
    PuntosUsuario(foundUser2, puntosGanados);
    LimpiarCarrito(foundUser2);
    AgregarAlHistorial(foundUser2, orden);
    orden.estado="pagado";
    cb({ok:true, msg:"orden creada exitosamente", data:orden});  //pa actualizar this things
}

// Mauricio Herraz
// funcion para generar reportes
function buildReport(config, from, to, data) {
  const values = data.map(i => i[config.key]);
  const { total, avg, max, min } = calcStats(values);
  return [
    `=== REPORTE DE ${config.title} === Desde: ${from} | Hasta: ${to}`,
    ...data.map(config.line),
    `---`,
    `Total: ${data.length} | Suma: ${total} | Promedio: ${avg.toFixed(2)} | Max: ${max} | Min: ${min}`,
  ].join("\n");
}

function makeReport(type, from, to, data) {
  const REPORT_CONFIGS = {
  ventas:    { title: "VENTAS",    key: "total",  line: (i) => `Orden: ${i.id} | Total: $${i.total} | Estado: ${i.estado}` },
  productos: { title: "PRODUCTOS", key: "prec",   line: (i) => `Producto: ${i.nom} | Precio: $${i.prec} | Stock: ${i.stock}` },
  usuarios:  { title: "USUARIOS",  key: "puntos", line: (i) => `Usuario: ${i.nombre} | Email: ${i.email} | Puntos: ${i.puntos}` },
  };
  if (!REPORT_CONFIGS[type]) return "";
  return buildReport(REPORT_CONFIGS[type], from, to, data);
}

// otra funcion para enviar notificacion (duplicado casi identico)
function crearNotificacion(channel, userId, message, payload, success) {
  return { channel: channel, userid: userId, message: message, payload: payload, timestamp: new Date(), success: succes };
}
function sendNotifi(channel, userId, message, payload) {
  const canalLog = {
    email: `Enviando email a usuario ${userId}: ${message}`,
    sms: `Enviando SMS a usuario ${userId}: ${message}`,
    push: `Enviando push a usuario ${userId}: ${message}`,
    inapp: `Guardando notif para usuario ${userId}: ${message}`
  }
  if (!canalLog[channel]) {
    console.error("Canal de notificacion no valido: " + channel);
    return { channel: channel, userid: userId, message: message, payload: payload, timestamp: new Date(), success: false, error: "canal no valido" };
  }
  console.log(canalLog[channel]);
  return crearNotificacion(channel, userId, message, payload, true);
}

//Jhon Santa Cruz
// manejo de cupones

  // lista de cupones hardcodeada
const cupones = [
    { code: "DESC10", tipo: "porcentaje", valor: 10, minCompra: 50000, maxUsos: 100, usos: 45, activo: true, expira: "2024-12-31", categorias: [], usuarios: [] },
    { code: "DESC20", tipo: "porcentaje", valor: 20, minCompra: 100000, maxUsos: 50, usos: 50, activo: true, expira: "2024-06-30", categorias: ["electronica"], usuarios: [] },
    { code: "ENVGRATIS", tipo: "envio", valor: 100, minCompra: 30000, maxUsos: 200, usos: 180, activo: true, expira: "2024-12-31", categorias: [], usuarios: [] },
    { code: "BIENVENIDO", tipo: "fijo", valor: 5000, minCompra: 20000, maxUsos: 1000, usos: 523, activo: true, expira: "2025-12-31", categorias: [], usuarios: [] },
    { code: "VIP2024", tipo: "porcentaje", valor: 25, minCompra: 200000, maxUsos: 20, usos: 15, activo: true, expira: "2024-12-31", categorias: [], usuarios: [1, 3, 5] }
  ];

//Funciones
// funcion para verificar si un cupon esta expirado
function isExpired(expirationDate){
  let hoy = new Date();
  let fechaExpiracion = new Date(expirationDate);

  if(hoy > fechaExpiracion){
    return true;
  }
  else{
    return false;
  }

}

// funcion para verificar si un cupon esta activo
function isUserAuthorized(autorizedUsers, currentUserId){
  if(autorizedUsers.length === 0){
  return true; // si no hay usuarios especificados, el cupon es para todos
  }

  let autorizado = false;
  for(let i = 0; i < autorizedUsers.length; i++){
    if(autorizedUsers[i] === currentUserId){
      autorizado = true;
      break; 
    }
  } 
  return autorizado;
}

// funcion para verificar si un cupon es valido para una compra (verifica monto minimo, usos, expiracion, etc)
function findCouponByCode(code){
  let cuponEncontrado = null;

  for(let i = 0; i < cupones.length; i++){
    if(cupones[i].code === code){
      cuponEncontrado = cupones[i];
      break;
    }
  }
  return cuponEncontrado;
}

// funcion para calcular el descuento de un cupon sobre un total de carrito
function calculateDiscount(cartTotal, cupon){
  let descuento = 0;

  if(cupon.tipo === "porcentaje"){
    descuento = cartTotal * (cupon.valor / 100);
  }else if(cupon.tipo === "fijo"){
    if(cupon.valor > cartTotal){
      descuento = cartTotal; // el descuento no puede ser mayor al total del carrito
    }else{
      descuento = cupon.valor;
    }
  }
    else if(cupon.tipo === "envio"){
      descuento = cupon.valor; // se asume que el valor del cupon de envio es el costo del envio  
    }
  return descuento;
}

function validateCoupon(coupon, userId, cartTotal){

  if (coupon === null) {
    return { ok: false, msg: "El cupón no existe", descuento: 0 };
  }
  
  if (coupon.activo === false) {
    return { ok: false, msg: "Cupón inactivo", descuento: 0 };
  }
  
  if (isExpired(coupon.expira) === true) {
    return { ok: false, msg: "El cupón ha expirado", descuento: 0 };
  }
  
  if (coupon.usos >= coupon.maxUsos) {
    return { ok: false, msg: "Cupón agotado", descuento: 0 };
  }
  
  if (cartTotal < coupon.minCompra) {
    return { ok: false, msg: "Monto mínimo no alcanzado", descuento: 0 };
  }
  
  if (isUserAuthorized(coupon.usuarios, userId) === false) {
    return { ok: false, msg: "Cupón no válido para este usuario", descuento: 0 };
  }

  return { ok: true, msg: "Validación correcta", descuento: 0 };
}

// Funcion principal para aplicar un cupon a una compra
function cupon(code, userId, cartTotal, products) {
  
  // Paso 1: Buscar
  const coupon = findCouponByCode(code);
  
  // Paso 2: Validar
  const validation = validateCouponRules(coupon, userId, cartTotal);
  
  if (validation.ok === false) {
    return validation; // Cortamos la ejecución si hay un error
  }

  // Paso 3: Calcular
  const descuentoFinal = calculateCouponDiscount(coupon, cartTotal);

  // Paso 4: Actualizar Base de datos simulada
  coupon.usos = coupon.usos + 1;

  // Retorno final exitoso
  return {
    ok: true,
    msg: "Cupón aplicado exitosamente",
    descuento: descuentoFinal,
    tipo: coupon.tipo
  };
}


// formatear precio
function formatearPrecioModerno(numero) {
  if (numero === null || numero === undefined || isNaN(numero) === true) {
    return "$0";
  }

  // Usamos el formateador nativo de JavaScript para pesos chilenos (es-CL, CLP)
  let formateador = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  });

  return formateador.format(numero);
}


// funcion que genera estrellas segun el rating de un producto (ejemplo: rating 4.5 => "★★★★☆")
function builStars(rating){
  const maxStars = Math.floor(rating);
  return "★".repeat(maxStars) + "☆".repeat(5 - maxStars);
}

//funcion para convertir el estado de stock a un texto legible
function getStockText(status){
  const estados = {
    "agotado": "Producto agotado",
    "critico": "¡Últimas unidades disponibles!",
    "bajo": "Quedan pocas unidades",
    "normal": "Disponible",
    "alto": "Stock disponible"
  };
  return estados[status] || "";
 }


// funcion para renderizar el HTML de un producto
function renderProductHTML(data){
  // Lógica de etiquetas y botones procesada antes del retorno para mantener limpieza
  const etiqueta = data.sinStock 
    ? `<div class='badge-agotado'>AGOTADO</div>` 
    : (data.pocoStock ? `<div class='badge-poco-stock'>${data.stockText}</div>` : "");

  const botonAccion = data.disponible 
    ? `<button onclick='addToCart(${data.id}, 1)' class='btn-cart'>Agregar al carrito</button>` 
    : `<button disabled class='btn-cart-disabled'>No disponible</button>`;

  return `
    <div class='product-card'>
      <div class='product-img'>
        <img src='${data.imagen}' alt='${data.nombre}'>
        ${etiqueta}
      </div>
      <div class='product-info'>
        <h3>${data.nombre}</h3>
        <div class='rating'>${data.stars} (${data.rating})</div>
        <p class='desc'>${data.descripcion}</p>
        <div class='price'>${data.precio}</div>
        <div class='category'>Categoría: ${data.categoria}</div>
        ${botonAccion}
      </div>
    </div>`;
}

// funcion para obtener los datos necesarios para renderizar la vista de un producto
function getProductViewData(product, products){
  const inventory = checkInventory(product.id, products);
  const status = inventory.status;
  
  return {
    id: product.id,
    nombre: product.nom,
    descripcion: product.desc,
    precio: formatearPrecioModerno(product.prec),
    categoria: product.cat,
    imagen: product.imgs && product.imgs.length > 0 ? product.imgs[0] : "no-image.jpg",
    sinStock: status === "agotado",
    pocoStock: status === "critico" || status === "bajo",
    stockText: getStockText(status),
    rating: product.rating,
    stars: builStars(product.rating),
    disponible: product.activo && status !== "agotado"
  };

}


//funcion pra validar los campos de un formulario de registro
function validateRegistrationForm(data){
  const errors = [];
  if (!data.nombre || data.nombre.length < 3) errors.push("Nombre debe tener al menos 3 caracteres");
  if (!data.email || data.email.includes("@")) errors.push("Email no es válido");
  if (!data.pass || data.pass.length < 8) errors.push("Password debe tener al menos 8 caracteres");
  if (data.pass !== data.passConfirm) errors.push("Passwords no coinciden");
  if (!data.rut || data.rut.length < 8) errors.push("RUT no es válido");
  return errors;

}

//funcion para procesar el registro de un usuario
function processRegistration(formData, usersDB){

  const errores = validateRegistrationForm(formData);
  if (errores.length > 0){
    return { ok: false, errors: errores };
  }

  if(usersDB.some(u => u.email === formData.email)){
    return { ok: false, errors: ["Email ya registrado"] };
  }

  const newUser = {
  ...formData,
    id: Math.floor(Math.random() * 9000) + 1000,
    tipo: "cliente",
    puntos: 0,
    activo: true,
    createdAt: new Date().toISOString(),
  };

  sendNotif("email", newUser.id, "Bienvenido a la tienda! Tu cuenta ha sido creada.", { userName: newUser.nombre });

  currentU = newUser;
  sessData = { user: newUser, token: "tkn_" + Math.random().toString(36).substr(2, 9), loginTime: new Date() };
  return { ok: true, user: newUser, session: sessData, redirect: "/dashboard" };

}


//funcion para gestionar la wishlist de un usuario
function gestionarWishlist(action, userId, prodId, usersDB){
  const user = usersDB.find(u => u.id === userId);
  if (!user) {
    return { ok: false, msg: "Usuario no encontrado" };
  }

  const acciones = {
    "add": () => {
      if (user.wishlist.includes(prodId)){
        return { ok: false, msg: "Producto ya en wishlist" };
      }
      user.wishlist.push(prodId);
      return { ok: true, msg: "Producto agregado a wishlist", wishlist: user.wishlist };
    },
    "remove": () => {
      const index = user.wishlist.indexOf(prodId);
      if (index === -1) {
        return { ok: false, msg: "Producto no en wishlist" };
      }
      user.wishlist.splice(index, 1);
      return { ok: true, msg: "Producto removido de wishlist", wishlist: user.wishlist };
    },  
    "get": () => {
      return { ok: true, msg: "Wishlist obtenida", wishlist: user.wishlist }
    }
  }; 
  return acciones[action] ? acciones[action]() : { ok: false, msg: "Acción no válida" }; 
}


//funcion para actualizar el perfil de un usuario
function actualizarPerfil(userId, newData, usersDB){
  const user = usersDB.find(u => u.id === userId);
  if (!user) {
    return { ok: false, msg: "Usuario no encontrado" };
  }

  Object.assign(user, newData);
  console.log("Usuario ${userId} actualizado");
  return { ok: true, user: user };
}


const dbReviews = [
  { id: 1, prodId: 101, userId: 2, rating: 5, comment: "Excelente laptop!", date: "2023-08-01", likes: 10, verified: true },
  { id: 2, prodId: 101, userId: 3, rating: 4, comment: "Muy buena pero cara", date: "2023-08-15", likes: 5, verified: true },
  { id: 3, prodId: 102, userId: 1, rating: 4, comment: "Buen mouse", date: "2023-09-01", likes: 2, verified: false },
  { id: 4, prodId: 103, userId: 5, rating: 5, comment: "El mejor teclado que he tenido", date: "2023-09-15", likes: 15, verified: true },
  { id: 5, prodId: 104, userId: 2, rating: 4, comment: "Monitor increible", date: "2023-10-01", likes: 8, verified: true }
];

// funcion para gestionar las reviews de un producto
function reviews(action, prodId, userId, rating, comment, reviwId){
  // acciones: getAll, add, like, delete
  const acciones = {
    "getAll": () => {
      const revs = dbReviews.filter(r => r.prodId === prodId);
      return { ok: true, reviews: revs, count: revs.length };
    },
    "add": () => {
      const newReview = {
        id: dbReviews.length + 1,
        prodId: prodId,
        userId: userId,
        rating: rating,
        comment: comment,
        date: new Date().toISOString().split("T")[0],
        likes: 0,
        verified: false
      };
      dbReviews.push(newReview);
      return { ok: true, review: newReview };
    },
    "like": () => {
      const review = dbReviews.find(r => r.id === reviwId);
      if (!review) {
        return { ok: false, msg: "Review no encontrada" };
      }
      review.likes++;
      return { ok: true, likes: review.likes };
    },
    "delete": () => {
      const index = dbReviews.findIndex(r => r.id === reviwId && r.userId === userId);
      if (index === -1) {
        return { ok: false, msg: "Review no encontrada o no autorizado" };
      }
      dbReviews.splice(index, 1);
      return { ok: true, msg: "Review eliminada correctamente" };
    }
  };
  return acciones[action] ? acciones[action]() : { ok: false, msg: "Acción no válida" };
}

// funcion para calcular el costo de envio basado en ciudad, peso, dimensiones, tipo de producto, urgencia, seguro, etc
function calcShipping(destCity, weight, dimensions, prodType, isUrgent, isFree, hasInsurance){
  if(isFree){
    return { costo: 0, desglose: "Envío gratis aplicado" };
  }
  
  const cityMultipliers = {
    "Santiago": 1,
    "Valparaiso": 1.2,
    "Concepcion": 1.4,
    "La Serena": 1.6,
    "Antofagasta": 1.8,
    "Iquique": 2.0,
    "Punta Arenas": 2.5
  };

  const typeMultipliers = {
    "normal": 1,
    "fragil": 1.5,
    "electronico": 1.3
  };

  const cityMult = cityMultipliers[destCity] || 1;
  const typeMult = typeMultipliers[prodType] || 1;

  let weightCost = 12000; // costo base para >20kg
  if (weight <= 1) weightCost = 2000;
  else if (weight > 1 && weight <= 5) weightCost = 3500;
  else if (weight > 5 && weight <= 10) weightCost = 5000;
  else if (weight > 10 && weight <= 20) weightCost = 8000;

  const baseCost = weightCost * cityMult * typeMult;
  const urgentCost = isUrgent ? baseCost * 0.5 : 0;
  const insuranceCost = hasInsurance ? baseCost * 0.1 : 0;
  const totalCost = baseCost + urgentCost + insuranceCost;

  return{
    costo: totalCost,
    base: baseCost,
    urgente: urgentCost,
    seguro: insuranceCost
  };

}

// funcion para verificar el inventario de un producto y retornar su estado (agotado, critico, bajo, normal, alto)
function checkInventory(prodId, products){
  const product = products.find(p => p.id === prodId);
  if (!product) {
    return { status: "no encontrado", stock: 0 };
  }

  //Definir estado de stock basado en cantidad
  const stock = product.stock;
  let status = "Alto";
  let color = "verde";
  let alert = false;

  //Definir niveles de stock
  if (stock === 0) {
    status = "agotado";
    color = "rojo";
    alert = true;
  }
  else if (stock > 0 && stock <= 5) {
    status = "critico";
    color = "rojo";
    alert = true;
  }
  else if (stock > 5 && stock <= 15) {
    status = "bajo";
    color = "naranja";
    alert = true;
  }
  else if (stock > 15 && stock <= 30) {
    status = "normal";
    color = "amarillo";
    alert = false;
  }
  return{
    ok: true,
    status: status,
    stock: stock,
    color: color,
    alert: alert,
    prodId: prodId
  };
}

//funcion para los logs de la aplicacion
function log(msg, level = "INFO", data = null) {
  //Obtener la marca de tiempo (Timestamp)
  const timestamp = new Date().toISOString();
  
  //Siempre mayusculas 
  const nivelFormateado = level.toUpperCase();

  let entry = `[${timestamp}] [${nivelFormateado}] ${msg}`;

  //Adjuntar datos extra solo si existen y son válidos
  if (data !== null && data !== undefined) {
    entry += ` | DATA: ${JSON.stringify(data)}`;
  }


  if (nivelFormateado === "ERROR") {
    console.error(entry);
    
  } else if (nivelFormateado === "WARN" || nivelFormateado === "WARNING") {
    console.warn(entry);
    
  } else if (nivelFormateado === "INFO") {
    console.info(entry);
    
  } else {
    // Fallback para logs generales, debugs, etc.
    console.log(entry);
  }
}

function paginarLista(items, page, size){
  // Validar que items sea un array válido
  if(items === null || items === undefined || !Array.isArray(items)){
    return { items: [], page: page, totalPages: 0, total: 0, size: size };
  }

  // Validar y ajustar número de página
  let paginaActual = page;
  if(paginaActual < 1){
    paginaActual = 1;
  }

  // Validar y ajustar tamaño de página
  let tamanoPagina = size;
  if(tamanoPagina < 1){
    tamanoPagina = 10; // valor por defecto
  }

  // Calcular total de items y páginas
  let totalItems = items.length;
  let totalPages = Math.ceil(totalItems / tamanoPagina);

  let inicio = (paginaActual - 1) * tamanoPagina;
  let fin = inicio + tamanoPagina;

  let itemsPagina = items.slice(inicio, fin);

  return {
    items: itemsPagina,
    page: paginaActual,
    totalPages: totalPages,
    total: totalItems,
    size: tamanoPagina
  }
}

// en caso de que alguien haya usado las funciones de paginacion antiguas
function paginateProducts(items, page, size) {
  return paginarLista(items, page, size);
}

function paginateUsers(items, page, size) {
  return paginarLista(items, page, size);
}

function paginateOrders(items, page, size) {
  return paginarLista(items, page, size);
}

// Franco
// refactorizacion de sorting
function sortByField(items, field, order) {
  const sortedItems = items.slice();

  sortedItems.sort((a, b) => {
    if (a[field] === b[field]) return 0;

    const isAscending = order === "asc";

    return (a[field] < b[field])
      ? (isAscending ? -1 : 1)
      : (isAscending ? 1 : -1);
  });

  return sortedItems;
}

function sortProducts(products, field, order) {
  return sortByField(products, field, order);
}

function sortUsers(users, field, order) {
  return sortByField(users, field, order);
}

function sortOrders(orders, field, order) {
  return sortByField(orders, field, order);
}


// formateo de fecha unificado
function padNumber(value) {
  return value < 10 ? "0" + value : value;
}

function formatDateTime(date) {
  const day = padNumber(date.getDate());
  const month = padNumber(date.getMonth() + 1);
  const year = date.getFullYear();

  const hours = padNumber(date.getHours());
  const minutes = padNumber(date.getMinutes());
  const seconds = padNumber(date.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function formatDateOnly(date) {
  const day = padNumber(date.getDate());
  const month = padNumber(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatDateFromString(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}


// utils reemplazado por funciones reales
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
function truncate(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function slugify(text) {
  return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
}
function deepClone(object) {
  return JSON.parse(JSON.stringify(object));
}
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}
function sumArray(numbers) {
  return numbers.reduce((sum, n) => sum + n, 0);
}
function averageArray(numbers) {
  return numbers.length ? sumArray(numbers) / numbers.length : 0;
}
function uniqueArray(array) {
  return [...new Set(array)];
}
function flattenArray(array) {
  return array.flat();
}

// export limpio
module.exports = {
  doEverything,
  v,
  calc,
  makeReport,
  sendNotif,
  notifyUser,
  cupon,
  search,
  fmtPrice,
  renderProduct,
  processRegistrationFormAndValidateAndSaveAndSendEmailAndLoginAndRedirect,
  wishlist,
  updateUserProfile,
  reviews,
  calcShipping,
  checkInventory,
  log,
  paginateProducts,
  paginateUsers,
  paginateOrders,
  sortProducts,
  sortUsers,
  sortOrders,

  // fechas
  formatDateTime,
  formatDateOnly,
  formatDateFromString,

  // utils separadas
  capitalize,
  truncate,
  getRandomNumber,
  slugify,
  deepClone,
  isEmptyObject,
  sumArray,
  averageArray,
  uniqueArray,
  flattenArray
};
