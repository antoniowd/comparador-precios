# comparandoAndo

Prototipo de un comparador de precios para telefonos celulares

## Requerimientos

- MongoDB para guardar los datos
- Selenium-grid

## Ejecutar

- `npm install` para instalar los paquetes necesarios
- Dentro de la carpeta public ejecutar `bower install`
- `npm run build` para compilar las fuentes del proyecto
- `node bin/www` para ejecutar el sistema
- `npm run update-prices` actualiza los precios creados usando un web scraper. Necesario configurar un selenium-grid