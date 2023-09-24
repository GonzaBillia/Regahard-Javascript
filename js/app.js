//pop over bootstrap funcion
const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
//pop over bootstrap funcion

//Local Storage
const localStorageKey = "ListaCarrito";
//Local Storage

//Consultar API
async function consumirAPI(){
    let respJSON = await fetch('../API.json')
    let listaproductosJS = await respJSON.json()

    return listaproductosJS
}
//ConsultarAPI

//Objetos

class Producto {
    constructor(id, tipoItem, marca, modelo, precio, stock, img, alt) {
        this.id = id;
        this.tipoItem = tipoItem;
        this.marca = marca.toUpperCase();
        this.modelo = modelo.toUpperCase();
        this.precio = parseFloat(precio);
        this.stock = parseInt(stock);
        this.img = img;
        this.alt = alt;
    }
    descripcionCarrito() {
        return `<div class="card mb-3" style="max-width: 540px;">
        <div class="row g-0">
            <div class="col-md-4">
                <img src="${this.img}" class="img-fluid rounded-start" alt="...">
            </div>
            <div class="col-md-8">
                <div class="card-body">
                    <p class="card-text">Item: ${this.tipoItem}</p>
                    <h5 class="card-title">${this.marca}  ${this.modelo}</h5>
                    <p class="card-text">Cantidad: ${this.cantidadSeleccionados}</p>
                    <p class="card-text">Precio: $${this.precio}</p>
                </div>
            </div>
        </div>
    </div>`
    }

    descripcionProducto() {
        return `<div class="card" style="width: 15rem;">
        <img src="${this.img}" class="card-img-top" alt="...">
        <div class="card-body">
        <h5 class="card-title">${this.marca}  ${this.modelo}</h5>
        <p class="card-text">Precio: $${this.precio}</p>
        <button class="btn btn-primary" id= "ap-${this.id}">Añadir al Carrito</button>
        </div>
        </div>`
    }
}

class ProductoController{
    constructor(){
        this.listaProductos = []
    }
    agregar(producto){
        this.listaProductos.push(producto)
    }

    async mostrarProductos(contenedor, tipoItem) {
        await this.convertirProductosDeAPI()
        let arrayProducto = []


        this.listaProductos.forEach(producto=>{
            if(producto.tipoItem === tipoItem){
                arrayProducto.push(producto)
            }
        })
        console.log(arrayProducto)

        let contenedorProductos = document.getElementById(contenedor)

        arrayProducto.forEach(producto => {
            if(contenedorProductos != null){
                contenedorProductos.innerHTML += producto.descripcionProducto();
            }
            
        })
    }

    agregarAlCarrito(){
        let arrayProducto = []
        arrayProducto.forEach(producto => {
            const btn_ap = document.getElementById(`ap-${producto.id}`)
    
            btn_ap.addEventListener("click", () => {
                carrito.agregar(producto);
                carrito.guardarEnStorage();
                carrito.mostrarProducto();
                carrito.calcularTotal();
                carrito.mostrarTotal();
            })
        });
    }

    async convertirProductosDeAPI(){
        let respJSON = await fetch('../API.json')
        let listaProductosJS = await respJSON.json()

        const listaAux = []
        listaProductosJS.forEach(producto => {
            let nuevoProducto = new Producto(producto.id, producto.tipoItem, producto.marca, producto.modelo, producto.precio, producto.stock, producto.img)
            listaAux.push(nuevoProducto);
        })
        this.listaProductos = listaAux
    }
}


class Carrito {
    constructor() {
        this.listaCarrito = [];
        this.total = 0;
    }

    agregar(producto) {
        if (producto instanceof Producto) {
            this.listaCarrito.push(producto);
        }
        this.calcularTotal();
    }

    guardarEnStorage() {
        let listaCarritoJSON = JSON.stringify(this.listaCarrito);
        localStorage.setItem(localStorageKey, listaCarritoJSON);
    }

    recuperarStorage() {
        let CarritoJSON = localStorage.getItem(localStorageKey);
        let listaCarritoJS = JSON.parse(CarritoJSON);
        let listaAux = [];

        if (listaCarritoJS !== null) {
            listaCarritoJS.forEach(producto => {
                let nuevoProducto = new Producto(producto.id, producto.tipoItem, producto.marca, producto.modelo, producto.precio, producto.stock, producto.img)
                listaAux.push(nuevoProducto);
            })
        }

        this.listaCarrito = listaAux;
        carrito.calcularTotal();
        carrito.mostrarTotal();
    }

    mostrarProducto() {
        let contenedor_carrito = document.getElementById("contenedor_carrito");
        contenedor_carrito.innerHTML = ``;
        this.listaCarrito.forEach(producto => {
            contenedor_carrito.innerHTML += producto.descripcionCarrito();
        });
    }

    vaciarCarrito() {
        let btnLimpiarCarrito = document.getElementById("limpiar_carrito");
        btnLimpiarCarrito.addEventListener("click", () => {
            this.listaCarrito = [];
            this.guardarEnStorage();
            this.mostrarProducto();
            this.total = 0;
            this.mostrarTotal();
        })
    }

    calcularTotal() {
        let acc = 0;

        this.listaCarrito.forEach(producto => {
            acc += producto.precio;
        })
        this.total = acc;
    }

    mostrarTotal() {
        let mostrarTotal = document.getElementById("calcular_total");
        mostrarTotal.innerHTML = this.total;
    }

    mostrarFinalizarCompra() {
        let finalizarCompra = document.getElementById("finalizar_compra");
        finalizarCompra.addEventListener("click", ()=>{
            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                    confirmButton: 'btn btn-success',
                    cancelButton: 'btn btn-danger'
                },
                buttonsStyling: false
            })
    
            swalWithBootstrapButtons.fire({
                title: 'Finalizar Compra?',
                text: "Se direccionara al formulario de Pago",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'No, Seguir Comprando',
                cancelButtonText: 'Si, Ir a Pagar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    swalWithBootstrapButtons.fire(
                        'Puedes Seguir Comprando',
                        'Tu carrito sigue ahi',
                        'success'
                    )
                } else if (
                    /* Read more about handling dismissals below */
                    result.dismiss === Swal.DismissReason.cancel
                ) {
                    swalWithBootstrapButtons.fire(
                        'Error',
                        'Todavia no se Programo esto :(',
                        'error'
                    )
                }
            })
        })
        
    }
}

//Objetos

//Inicializadores

let PC = new ProductoController()
let carrito = new Carrito()

PC.convertirProductosDeAPI()


const contenedor_micros = document.getElementById("contenedor_microprocesadores");
const contenedor_placasmadre = document.getElementById("contenedor_placasmadre");
const contenedor_discos = document.getElementById("contenedor_discos");
const contenedor_memorias = document.getElementById("contenedor_memorias");
const contenedor_fuentes = document.getElementById("contenedor_fuentes");
const contenedor_gabinetes = document.getElementById("contenedor_gabinetes");

PC.mostrarProductos(contenedor_micros, "Micropocesador")
PC.mostrarProductos(contenedor_placasmadre, "Placa Madre")
PC.mostrarProductos(contenedor_discos, "Disco")
PC.mostrarProductos(contenedor_memorias, "Memoria Ram")
PC.mostrarProductos(contenedor_fuentes, "Fuente")
PC.mostrarProductos(contenedor_gabinetes, "Gabinete")

//Inicializadores

