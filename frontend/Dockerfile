# Usar una imagen base de Node.js
FROM node:18-alpine

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Instalar dependencias de construcción para Alpine y Node.js
RUN apk add --no-cache python3 make g++

# Copiar los archivos de package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Verificar la instalación de react-scripts
RUN ls -l /app/node_modules/.bin/

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que se ejecuta la aplicación React
EXPOSE 3000

# Comando para ejecutar la aplicación React en modo desarrollo
CMD ["npm", "start"]
