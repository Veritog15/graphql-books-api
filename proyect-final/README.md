<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# API GraphQL y WebSocket con NestJS
Este proyecto implementa una API GraphQL para gestionar libros y un WebSocket para un chat en tiempo real, utilizando NestJS. A continuación, se detalla cómo configurarlo y por qué se usan los componentes.
Requisitos

Node.js (v16 o superior)
NestJS CLI: ``` npm install -g @nestjs/cli ```
GitHub: Clona este repositorio

# Opción 1: API GraphQL
Funcionalidad: API para gestionar libros (id, title, author) con queries (books, book) y una mutación (createBook).
Cómo hacer que funcione

## Instalar dependencias:
```
cd graphql-books-api
npm install
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
```
Iniciar el servidor: ``` npm run start:dev ```

## Probar en GraphQL Playground:
Abre  ``` http://localhost:3000/graphql ```
Prueba queries: 
```
query { books { id title author } }
query { book(id: "1") { id title author } }
mutation { createBook(input: { title: "1984", author: "George Orwell" }) { id title author } }
```
## Componentes y por qué

NestJS: Framework modular y escalable con soporte para TypeScript, ideal para APIs robustas.
``` @nestjs/graphql ``` y ```@apollo/server: Habilitan GraphQL``` con un enfoque code-first, generando esquemas automáticamente.
GraphQL Playground: Interfaz interactiva para probar queries y mutaciones.
Por qué: GraphQL ofrece flexibilidad para que los clientes soliciten solo los datos necesarios, y NestJS simplifica la implementación.

# Opción 2: WebSocket
Funcionalidad: Chat en tiempo real que permite enviar y recibir mensajes, mostrándolos en consola y reenviándolos a todos los clientes.
Cómo hacer que funcione

### Instalar dependencias: ``` npm install @nestjs/websockets @nestjs/platform-socket.io ws ```
### Iniciar el servidor: ``` npm run start:dev ```

### Probar con un cliente WebSocket:
Crea un archivo ```index.html ``` en una carpeta separada (ej. ``` websocket-client```):
```
<!DOCTYPE html>
<html>
<head>
  <title>Chat WebSocket</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.js"></script>
</head>
<body>
  <h1>Chat Simple</h1>
  <input id="message" type="text" placeholder="Escribe un mensaje">
  <button onclick="sendMessage()">Enviar</button>
  <ul id="messages"></ul>
  <script>
    const socket = io('http://localhost:3000');
    socket.on('message', (data) => {
      const li = document.createElement('li');
      li.textContent = `De ${data.sender}: ${data.content}`;
      document.getElementById('messages').appendChild(li);
    });
    function sendMessage() {
      const message = document.getElementById('message').value;
      socket.emit('message', message);
      document.getElementById('message').value = '';
    }
  </script>
</body>
</html>
```
Sirve index.html con: ``` npm install -g http-server ```
``` http-server -p 8080 ```

Abre ``` http://localhost:8080 ``` en dos pestañas, envía mensajes y verifica que aparezcan en ambas y en la consola del servidor.

## Componentes y por qué

``` @nestjs/websockets y @nestjs/platform-socket.io ```: Proveen soporte para WebSocket, con Socket.IO para gestionar conexiones y eventos en tiempo real.
```Socket.IO Client ```: Simplifica la conexión desde el navegador al servidor WebSocket.
Por qué: WebSocket permite comunicación bidireccional en tiempo real, ideal para chats, y ```Socket.IO``` es fácil de usar y ampliamente soportado.
```@nestjs/websockets``` y ```@nestjs/platform-socket.io```: Habilitan WebSocket en NestJS, con ```Socket.IO``` para gestionar conexiones y eventos en tiempo real de forma sencilla.
```@nestjs/serve-static:``` Sirve ```index.html``` desde el backend, eliminando la necesidad de un servidor externo y resolviendo errores 404.
```Socket.IO Client```: Permite al navegador conectarse al WebSocket y manejar eventos de chat.
Por qué: WebSocket es ideal para comunicación bidireccional en tiempo real, y Socket.IO simplifica la implementación con soporte multiplataforma.

## Estructura del proyecto
```src/books/```: Módulo para la API GraphQL (entidad Book, queries y mutaciones).
```src/chat/```: Módulo para el WebSocket (gateway para el chat).
```public/```: (Opcional) Carpeta para servir index.html si usas ```@nestjs/serve-static```.


# Opción 3: Microservicio Básico con TCP
## Funcionalidad: 
Dos microservicios dentro del proyecto: uno (Time Server) responde con la hora actual al comando get_time, y otro (Time Client) envía el comando y expone un endpoint HTTP para pruebas.
Cómo hacer que funcione

### Instalar dependencias:
```npm install @nestjs/microservices```
### Iniciar el servidor:
```npm run start:dev```
Esto inicia el servidor HTTP en ```http://localhost:3000``` (GraphQL, WebSocket, Time Client) y el microservicio TCP en ```localhost:3001``` (Time Server).

### Probar la comunicación:
Usa curl o un navegador:
```curl http://localhost:3000/time```
Resultado esperado: Una respuesta como ``` "2025-07-03T15:05:00.000Z" ``` (hora actual).
### Estructura:
```src/time-server/```: Módulo para el microservicio servidor (responde a ```get_time```).
```src/time-client/```: Módulo para el microservicio cliente (envía ```get_time``` y expone ```GET /time```).

## Componentes y por qué
```@nestjs/microservices```: Permite configurar microservicios con transporte TCP en NestJS.
TCP: Protocolo simple y eficiente para comunicación entre microservicios en el mismo proyecto.
Por qué: TCP es ideal para pruebas locales, y NestJS simplifica la integración de microservicios con ```@MessagePattern``` y ```@Client```.

## Notas
Asegúrate de que el servidor esté en ```http://localhost:3000```.
Para CORS en WebSocket, el gateway permite conexiones de cualquier origen ``` (cors: { origin: '*' }) ```
Subido a GitHub para facilitar el acceso y colaboración.
El WebSocket usa CORS ```(cors: { origin: '*' })``` para permitir conexiones desde cualquier origen.
Revisa ```src/chat/chat.gateway.ts``` para la lógica del WebSocket y ```src/app.module.ts``` para la configuración de ServeStaticModule.
Asegúrate de que el puerto 3000 (HTTP) y 3001 (TCP) estén libres.
Revisa ```src/main.ts``` para la configuración de la aplicación híbrida y ```src/app.module.ts``` para los módulos.
