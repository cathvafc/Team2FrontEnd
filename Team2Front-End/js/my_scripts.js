//Función para obtener el Token del User introducido en el LogIn
function CheckUser()
{
   var Email =  document.getElementById("inputEmail").value;
   var Password = document.getElementById("inputPassword").value;
  
   //Petición asíncrona a api/Token para obtener el token
   $.ajax({

        url: "https://localhost:44396/api/Token",
        method: 'POST',       
        dataType: 'json',       
        headers: {
            'Accept':'application/json'}, 

        contentType: 'application/json',   
           
        data: JSON.stringify({
            'Email': Email, 
            'Password': Password}),

        success: function (data) {
            
            //Almacenamos el token en localstorage
            localStorage.setItem('token', data);
            //Llamamos a la función para obtener el resto de datos
            DataDownload (data);
            
           
        },
        error: function (error){
            alert('Error');
        }

   });
}
//Función para obtener ListaTrabajadores y ListaDepartamentos
function DataDownload (data)
{
    //Petición asíncrona a api/Trabajadores para obtener la lista de trabajadores en formato JSON
    $.ajax({

        url: "https://localhost:44396/api/Trabajadores",
        method: 'GET',
        dataType: "json",
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + data
        },
        contentType: 'application/x-www-form-urlencoded',
        success: function (trabajador) {
            //Almacenamos la lista de trabajadores en localstorage
            localStorage.setItem('ListaTrabajadores',trabajador);

        },
        error: function (error){
            alert('Error');
        }
    
    });
    
   //Petición asíncrona a api/Departamento para obtener la lista de departamentos en formato JSON
    $.ajax({

        url: "https://localhost:44396/api/Departamento",
        method: 'GET',
        dataType: "json",
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + data
        },
        contentType: 'application/x-www-form-urlencoded',
        success: function (Departamentos) {
           //Almacenamos la lista de departamentos en localstorage
            localStorage.setItem('ListaDepartamentos', Departamentos);

        },
        error: function (error){
            alert('Error');
        }
    
    });
   //Actualizamos la página a index
    document.location.replace('index.html');

}
//Variable global para mantener la información del departamento anterior seleccionado
let BotonAnterior;

//Función para calcular los KPI para el departamento
function CalcularKPI(Lista, item)
{
    //Ocultamos el dropdown anterior al seleccionado actualmente
    if (BotonAnterior != null)
    {
       document.getElementById(BotonAnterior + "EjemploId").style.display = 'none';
    }

    //Actualizamos variable global
    BotonAnterior = item;

    //Si no hemos creado el elemento
    if (!document.getElementById(item + "EjemploId"))
    {
        /*        Creación de elementos y asignación de tipos y clases        */ 
        var label = document.getElementById(item + "label");
        var div = document.createElement('div');
        var divMenu = document.createElement('div');
        var button = document.createElement('button');
     

        div.classList.add("dropdown");
        
        divMenu.classList.add("dropdown-content");
        
        button.classList.add("dropbtn");
     
        button.innerHTML = "<img src=../Resources/Images/Flecha.png width=20 height=10> ";      
        div.appendChild(button);
        
        div.id = item + "EjemploId";

        /*        Creación de tablas y asignación de datos a mostrar        */ 

        var divTabla1 = document.createElement('a');
        var divTabla2 = document.createElement('a');
        var mapaTipoEmpleado = new Map();
        var mapaGrupo = new Map();

        //Generamos y llenamos los datos
        Lista.forEach(element =>{

            if (mapaTipoEmpleado.has(element.TIPO_EMPRESA))
            {
                var num = mapaTipoEmpleado.get(element.TIPO_EMPRESA);

                mapaTipoEmpleado.set(element.TIPO_EMPRESA, num+1);
            }
            else
            {
                mapaTipoEmpleado.set(element.TIPO_EMPRESA, 1);
            }

            if (mapaGrupo.has(element.GRUPO))
            {
                var num = mapaGrupo.get(element.GRUPO);

                mapaGrupo.set(element.GRUPO, num+1);
            }
            else
            {
                mapaGrupo.set(element.GRUPO, 1);
            }

        });
        //Generamos el contenido del dropdown para tipo empleado
        mapaTipoEmpleado.forEach(function(value, key){

            var p = document.createElement('p');
            
            var operacion = value*100 / Lista.length;

            p.innerHTML = key + "&emsp;" + "&emsp;"  + value + "&emsp;" + "&emsp;"  + operacion + " &#37;";               
            divTabla1.appendChild(p);
            
        }, mapaTipoEmpleado);

        var p = document.createElement('p');
        p.innerHTML = "Total &emsp; &emsp; &emsp; &emsp;" + Lista.length + "&emsp;" + "&emsp;" + "&emsp;" + "&emsp;" + "&nbsp;"; 
        divTabla1.appendChild(p);

        //Generamos el contenido del dropdown para grupo
        mapaGrupo.forEach(function(value, key){

            var p = document.createElement('p');

            var operacion = value*100 / Lista.length;

            p.innerHTML = key + "&emsp;" + "&emsp;"  + value + "&emsp;" + "&emsp;"  + operacion + " &#37;";  
            divTabla2.appendChild(p);
        },mapaGrupo);

        var p = document.createElement('p');
        p.innerHTML = "Total &emsp; &emsp; &emsp; &emsp;" + Lista.length + "&emsp;" + "&emsp;" + "&emsp;" + "&emsp;" + "&nbsp;" + "&nbsp;"; 
        divTabla2.appendChild(p);

        //Asignación de dependencia padre/hijo
        divTabla1.classList.add('dropdown-item');
        divTabla2.classList.add('dropdown-item');
        divMenu.appendChild(divTabla1);
        divMenu.appendChild(divTabla2);
        div.appendChild(divMenu);
        label.appendChild(div);

    }
    else // Si hemos creado el elemento, lo mostramos
    {
        document.getElementById(BotonAnterior + "EjemploId").style.display = 'block';
    }
}

//Función para filtrar los trabajadores mostrados en la tabla central por el departamento seleccionado
function FiltrarTrabajadoresPorDepartamento(item)
{
    var temporal = localStorage.getItem("ListaTrabajadores");
    
    var Lista = JSON.parse(temporal);
    var Lista2 = [];

    //Se escogen los trabjadores filtrando por CAMINO
    Lista.forEach(element =>{

        var camino = element.CAMINO;

        if (camino.includes(item))
        {

            Lista2.push(element);

        }
        
    });
    //Calculamos los KPI para el departamento
    CalcularKPI(Lista2, item);

    //Destruimos tabla
    $('#tablax').DataTable().destroy();
    //Actualizamos la tabla con los nuevos datos en Lista2
    $('#tablax').DataTable({
        data: Lista2,
        language: {
            processing: "Tratamiento en curso...",
            search: "Buscar&nbsp;",
            info: "Mostrando del item _START_ al _END_ de un total de _TOTAL_ items",
            infoEmpty: "No existen datos.",
            infoFiltered: "(filtrado de _MAX_ elementos en total)",
            infoPostFix: "",
            loadingRecords: "Cargando...",
            zeroRecords: "No se encontraron datos con tu busqueda",
            emptyTable: "No hay datos disponibles en la tabla.",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Ultimo"
            },
            aria: {
                sortAscending: ": active para ordenar la columna en orden ascendente",
                sortDescending: ": active para ordenar la columna en orden descendente"
            }
        },               
        
        
        bLengthChange : false,
        lengthMenu:  [15],

        columns: [
            { title: "Código", data: "ID_TRABAJADOR"},
            { title: "Empresa", data: "EMPRESA"},
            { title: "Nombre", data: "NOMBRE"},
            { title: "TP", data: "TP"},
            { title: "Tipo Empleado", data: "TIPO_EMPRESA"},
            { title: "Grupo", data: "GRUPO"},
            { title: "Cuerpo", data: "CUERPO"},
            { title: "Categoría", data: "CATEGORIA"}
            
        ]
        
    });
        
}

//Función para filtrar el menu de departamentos
function Filtrado()
{

    var nombreDepartamento = document.getElementById("resultado").value;

    var temporal = localStorage.getItem("ListaDepartamentos");
    var Lista =  JSON.parse(temporal);

    //Comprobamos que nombreDepartamento no este vacia
    if (nombreDepartamento != "")
    {
        //Muestra todos los departamentos que incluyan nombreDepartamento en su nombre
        Lista.forEach(element => {
            var palabra = element.NOMBRE;
            
            if(!palabra.includes(nombreDepartamento) )
            {
                document.getElementById(element.CAMINO).style.display = 'none';

                if(document.getElementById(element.CAMINO + "EjemploId"))
                {
                    document.getElementById(element.CAMINO + "EjemploId").style.display = 'none';
                }
                
            }
            else
            {
                document.getElementById(element.CAMINO).style.display = 'block' 
            }
          
        });
    }
    else // Mostramos todos los departamentos
    {
        Lista.forEach(element => {

            document.getElementById(element.CAMINO).style.display = 'block'        
                           
        });
    }
}

//Función de inicialización de la tabla central con departamento Ayuntamiento por defecto
function Tabla() {
    $('#tablax').DataTable({
        
        language: {
            processing: "Tratamiento en curso...",
            search: "Buscar&nbsp;",
            info: "Mostrando del item _START_ al _END_ de un total de _TOTAL_ items",
            infoEmpty: "No existen datos.",
            infoFiltered: "(filtrado de _MAX_ elementos en total)",
            infoPostFix: "",
            loadingRecords: "Cargando...",
            zeroRecords: "No se encontraron datos con tu busqueda",
            emptyTable: "No hay datos disponibles en la tabla.",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Ultimo"
            },
            aria: {
                sortAscending: ": active para ordenar la columna en orden ascendente",
                sortDescending: ": active para ordenar la columna en orden descendente"
            }
        },               
        
        
        bLengthChange : false,
        lengthMenu:  [15],

        columns: [
            { title: "Código", data: "ID_TRABAJADOR"},
            { title: "Empresa", data: "EMPRESA"},
            { title: "Nombre", data: "NOMBRE"},
            { title: "TP", data: "TP"},
            { title: "Tipo Empleado", data: "TIPO_EMPRESA"},
            { title: "Grupo", data: "GRUPO"},
            { title: "Cuerpo", data: "CUERPO"},
            { title: "Categoría", data: "CATEGORIA"}
            
        ]
        
    });
    //Departamento Ayuntamiento por defecto
    FiltrarTrabajadoresPorDepartamento("00001");

};


  