const url = "https://ca99-181-231-122-56.ngrok-free.app/student"; ////Descomentar cuando vuelva el link... Update: dejar o ver si es necesario el /student en la URL
const linkref = document.getElementById("link")
linkref.innerHTML = "Link actual = " + url;

window.onload = function () {
  obtenerEstudiantes();
}; //Mas comodo que usar botones para actualizar la pagina.


////////////PROMESAS////////////////////////////////////////////////////////////////////////////////

function loadStudents(url) { //La funcion de cargar y traer los datos. Le pasamos la url por parametro
  
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();
    request.open("GET", url + "/getAll"); //Le añadimos un endpoint
    request.responseType = "json";
    request.onload = function () {
      if (request.status == 200) { //Si esta todo ok, nos traemos el listado.
        resolve(request.response);
      } else {
        reject( //Si no se pudo, dar el error.
          Error("Image could not be loaded. Error: " + request.statusText));
      }
    };

    request.onerror = function () {
      reject(Error("Oops!, there was a network error."));
    };
    request.send();
  });
}

function addStudent() { //Esta promesa agrega un estudiante (con algunos datos hardcodeados) y es consumida por la funcion guardarEstudiante()
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();
    request.open("POST", url);
    request.setRequestHeader("Content-Type", "application/json");
    var estudiante = JSON.stringify({
      //En esta variable estudiante, guardamos y pasamos como string toda la informacion que mandemos en los input de SaveStudent, o como se llame la funcion que consuma de nuestra promesa
      dni: document.getElementById("dni").value,
      lastName: document.getElementById("lastName").value,
      firstName: document.getElementById("firstName").value,
      email: document.getElementById("email").value,
      cohort: "1",
      status: "studying :P",
      gender: "masculino",
      address: "",
      phone: "444555666",
    });
    request.onload = function () {
      if (request.status == 201) {
        resolve(request.response);
      } else {
        reject(Error(request.statusText));
      }
    };

    request.onerror = function () {
      reject(Error("Error: error de conexion inesperado"));
    };

    request.send(estudiante);
  });
}

function removeStudent(id) { //Promesa que borra un estudiante. Consumida por funcion borrarEstudiante()
  return new Promise(function(resolve,reject) {
    var request = new XMLHttpRequest();
    request.open('POST', url + `/${id}/delete`);
    request.setRequestHeader("Content-Type","application/json");
    request.onload = function () {
      if (request.status == 200) {
        resolve(request.response);
      }
      else{
        reject(Error(request.statusText));
      }
    };
    request.onerror = function () {
      reject (Error("Error : error de red inesperado"));
    };
    request.send();
  });
}

function modifyStudent() { //Modifica la info de un estudiante, al capturar lo que el usuario escriba en los campos bajo la tabla
  return new Promise (function (resolve,reject){
    var request = new XMLHttpRequest();
    request.open('POST', url + `/${document.getElementsByName("id2")[0].value}/update`);
    request.setRequestHeader("Content-Type", "application/json");
    var estudiante = JSON.stringify ({
    dni: document.getElementsByName("dni2")[0].value,
    lastName: document.getElementsByName("lastName2")[0].value,
    firstName: document.getElementsByName("firstName2")[0].vale,
    email: document.getElementsByName("email2")[0].value, 
    cohort: "1",
    status: "Estudiando :P",
    gender: "male",
    address: "S.C 1000",
    phone: "777888999",
    });
    request.onload = function() {
      if (request.status == 200) {
        resolve(request.resolve);
      }
      else {
        reject(Error(request.statusText));
      }
    };
    request.onerror = function(){
      reject(Error("Error de conexion inesperado :p"));
    };
    request.send(estudiante);
  });

}

///////////FUNCIONES QUE CONSUMEN DE LAS PROMESAS////////////////////

function obtenerEstudiantes() { //Esta funcion se utiliza para colocar a los estudiantes obtenidos en nuestra tabla HTML
  
  loadStudents(url)
    .then((response) => {
      var tbody = document.getElementById("body");
      tbody.innerHTML = ""; //Linea importante para evitar que se dupliquen abajo los datos mas nuevos de la tabla
      console.log(response);
      response.forEach((element) => {
      
        var row = tbody.insertRow();
        var id = row.insertCell();
        id.innerHTML = element.id;
        var dni = row.insertCell();
        dni.innerHTML = element.dni;
        var lastName = row.insertCell();
        lastName.innerHTML = element.lastName;
        var firstName = row.insertCell();
        firstName.innerHTML = element.firstName;
        var email = row.insertCell();
        email.innerHTML = element.email;
        var student = JSON.stringify({
          id: element.id,
          dni: element.dni,
          lastName: element.lastName,
          firstName: element.firstName,
          email: element.email,

        });
        var view = row.insertCell();
        view.innerHTML = `<button onclick ='verEstudiante(${student})'>Ver</button`;
        var del = row.insertCell();
        del.innerHTML = `<button onclick = 'borrarEstudiante(${element.id})'>Borrar</button>`;
      });
      document.getElementById("dni").value = "";
      document.getElementById("lastName").value = "";
      document.getElementById("firstName").value = "";
      document.getElementById("dni").focus();
    })
    .catch((reason) => {
      console.log(Error(reason));
    });
}

function guardarEstudiante() { //Esta funcion se usa para guardar la informacion del estudiante, que se escribio en los inputs, en el servidor
  if (
    document.getElementById("dni").value.trim() !== "" &&
    document.getElementById("lastName").value.trim() !== "" &&
    document.getElementById("firstName").value.trim() !== "" &&
    document.getElementById("email").value.trim() !== ""  
  ) {
    addStudent()
      .then(() => {
        obtenerEstudiantes();
      })
      .catch((reason) => {
        console.error(reason);
      });
  }
}

function verEstudiante(student){ //Colocamos los datos de un estudiante especifico en los cambos de abajo de la tabla
  document.getElementsByName("id2")[0].value = student.id; //Es importante diferenciar Id de Name.
  document.getElementsByName("dni2")[0].value = student.dni;
  document.getElementsByName("lastName2")[0].value = student.lastName;
  document.getElementsByName("firstName2")[0].value = student.firstName;
  document.getElementsByName("email2")[0].value = student.email;

  
}

function borrarEstudiante(id) { //Borramos un unico estudiante. Consumimos de removeStudent()
  removeStudent(id)
  .then(() => {
    obtenerEstudiantes();
  })
  .catch(() => {
    console.error(reason);
  });
}

function actualizarEstudiante () { //Actualizamos un estudiante especifico con los datos mas nuevos escritos en los campos de abajo de la tabla.

//Hay un problema con esta funcion o con modifyStudent() de la cual consume. 
        modifyStudent()
    .then(() => {
      //$("#popUp").dialog("close");
      obtenerEstudiantes();
    })
    .catch(reason => {
      console.error(reason);
    });
}

/*
$(document).ready(function(){
})

  $.getJSON("peopleList.json" , function(data){
    console.log(data)

  }).fail(function(){
    console.log("Chequea tu codigo :D")
  })
*/
