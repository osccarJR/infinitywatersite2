# Infinity Watersite

**Infinity Watersite** es una página web destinada a ofrecer soluciones para la venta, instalación y mantenimiento de sistemas de purificación de agua, con un enfoque en la tecnología de ósmosis y ultrafiltración. Además, la página está configurada para integrar servicios de mantenimiento continuo, filtros y repuestos, y soporte técnico 24/7, mejorando la calidad del agua en hogares y negocios locales. Este proyecto ha sido desarrollado utilizando tecnologías modernas como **Node.js**, **Tailwind CSS**, y **Docker**, entre otras.

## Características

- **Venta y Mantenimiento de Purificadores**: Proveedor principal de sistemas de purificación de agua, con opciones de instalación y servicio de mantenimiento.
- **Fácil Acceso a Repuestos**: Venta de filtros y repuestos esenciales para asegurar la continuidad de los sistemas.
- **Soporte Técnico 24/7**: Servicio postventa con atención continua para cualquier consulta técnica o necesidad de mantenimiento.
- **Próxima Tienda Online**: Preparación para la implementación de un sistema de ventas online para facilitar el acceso a productos y servicios.

## Tecnologías Usadas

- **Node.js**: Framework backend para manejar la lógica de la aplicación.
- **Tailwind CSS**: Framework de CSS utilizado para estilizar la interfaz de usuario de manera responsiva y moderna.
- **Docker**: Contenedores para la implementación y el despliegue eficiente en ambientes aislados.
- **Vite**: Herramienta de desarrollo rápida y ligera utilizada para la compilación de proyectos frontend.
- **Nginx**: Servidor web utilizado para gestionar las solicitudes de los usuarios y la configuración de proxy.
- **ESLint**: Herramienta para la gestión de calidad de código en JavaScript.

## Instalación

### Requisitos

Asegúrate de tener instalado lo siguiente en tu máquina:

- **Node.js**: [Descargar Node.js](https://nodejs.org/)
- **Docker**: [Descargar Docker](https://www.docker.com/products/docker-desktop)
- **Git**: [Descargar Git](https://git-scm.com/)

### Pasos de Instalación

1. Clona el repositorio a tu máquina local:

```bash
git clone https://github.com/osccarJR/infinitywatersite.git
Navega al directorio del proyecto:

bash
Copiar código
cd infinitywatersite
Instala las dependencias necesarias para el proyecto:

bash
Copiar código
npm install
Crea un archivo .env si es necesario para la configuración del entorno (dependiendo de las necesidades de tu aplicación).

Inicia el servidor de desarrollo:

bash
Copiar código
npm run dev
Para producción, puedes construir el proyecto y ejecutarlo en un contenedor Docker:

bash
Copiar código
docker-compose up --build
Estructura del Proyecto
La estructura del proyecto es la siguiente:

php
Copiar código
infinitywatersite/
├── .gitignore          # Archivos y directorios a ignorar por Git
├── docker-compose.yml  # Configuración de Docker para el entorno de producción
├── Dockerfile          # Archivo de configuración de Docker para la app
├── public/             # Archivos estáticos (imágenes, fuentes, etc.)
├── src/                # Código fuente de la aplicación
│   ├── index.js        # Entrada principal de la aplicación
│   └── ...             # Otros archivos de lógica y componentes
├── package.json        # Dependencias y scripts del proyecto
├── README.md           # Este archivo
├── tailwind.config.js  # Configuración de Tailwind CSS
└── vite.config.js      # Configuración de Vite
