# subtiREST
Un wrapper RESTful para subtitulos.es

------------------------------------------------

## Dependencias
- Python (2.7 o superior)
	- pymongo
	- beautifulsoup4
	- zerorpc
	- HTMLParser
	- urllib2
	- logging
	- json
- MongoDB
- NodeJS
	- mongoose 3.8.12
	- express 4.0.0
	- method-override 2.1.2
	- body-parser 1.5.1
	- zerorpc

## Instalación
Desde el directorio raíz del proyecto, ejecutar:

```
sudo pip install pymongo beautifulsoup4 zerorpc
cd server/
npm install
```

## Ejecución
Desde el directorio raíz del proyecto, iniciar la BD.

```
mongod --dbpath=./databases
```

Si es la primera ejecución, hay que poblar la colección del índice de series.

```
python scrapers/index_scraper.py
```

Para poder obtener los títulos no guardados en la BD, hay que correr el servidor zeroRPC.

```
python scrapers/title_scraper
```

Y por último, iniciar el servidor Node.

```
nodejs server/server.js &
```

# Routes
Todas las rutas comienzan por http(s)://< host >:< puerto >. Por defecto, la URL base es http://localhost:3000/api/v1.

#### Terminología
- id: identificador único de cada serie en subtitulos.es. Por ejemplo, el identificador 90 corresponde a la serie subtitulos.es/show/90, _Lost_.
- name / show\_name: nombre de la serie. _Lost_, _Fringe_, _The Big Bang Theory_ etc.
- season: temporada, _series_
- chapter: capítulo, episodio.
- show\_url: dirección _absoluta_ de la serie en subtitulos.es. La _show\_url_ de _Lost_ sería http://subtitulos.es/show/90
- base\_url: dirección base de la serie para acceder a sus distintos capítulos.
- La _base\_url_ de Lost sería http://subtitulos.es/lost/, y con esa URL se construiría la de los capítulos añadiendo SxCC (S -> season, CC -> chapter)

#### Errores
El error viene identificado por el valor del key _error_, presente siempre. En caso de que sea _True_, irá acompañado de un código de error y un mensaje.

```
{
	error: true,
    error_id: <id>,
    message: <"message">
}
```

### /info/id/:id
Obtiene la información relativa al show con identificador :id. El identificador se refiere al número único que identifica a una serie en el índice de subtitulos.es

```
GET http://localhost:3000/api/v1/info/id/117
```

```
{
	error: false
	show: {
		_id: 117
		show_url: http://subtitulos.es/show/117
		name: "Doctor Who (2005)"
		base_url: http://subtitulos.es/doctor-who-(2005)/
		chapters: 130
		seasons: 8
		}
}
```

- error 0: interno.
- error 10: show not found.

### /info/name/:name
Obtiene la información relativa al show con nombre :name. El nombre se refiere al nombre exacto que tiene una serie en subtitulos.es

```
GET http://localhost:3000/api/v1/info/name/Lost
```

```
{
	error: false
	-show: {
		_id: 90
		show_url: http://subtitulos.es/show/90
		name: "Lost"
		base_url: http://subtitulos.es/lost/
		chapters: 65
		seasons: 4
	}
}
```

- error 0: interno
- error 10: show not found.

### /title/id/:id/:season/:chapter
Obtiene el nombre del capítulo de la serie con identificador :id, temporada :season y capítulo :chapter.

```
GET http://localhost:3000/api/v1/title/id/117/7/14
```

```
{
	error: false
	title: "The Day of the Doctor (50th Anniversary Special)"
}
```

- error 11: Title not found

### /title/name/:name/:season/:chapter
Obtiene el nombre del capítulo de la serie con nombre exacto :name, temporada :season y capítulo :chapter.

```
GET http://localhost:3000/api/v1/title/name/The Office/7/22
```

```
{
	error: false
	title: "Goodbye Michael"
}
```

- error 11: Title not found

### /search/name/:search
Busca todas las series que contengan :search en su nombre.

```
GET http://localhost:3000/api/v1/search/name/The Office
```

```
{
	error: false
	result_count: 2
	-result: [
		-{
			_id: 62
			show_url: http://subtitulos.es/show/62
			name: "The Office"
			base_url: http://subtitulos.es/the-office/
			chapters: 126
			seasons: 7
		}
		-{
			_id: 2008
			show_url: http://subtitulos.es/show/2008
			name: "The Office (UK)"
			base_url: http://subtitulos.es/the-office-(uk)/
			chapters: 1
			seasons: 1
		}
	]
}
```

- error 0: interno.

### /search/seasons/:critera/:seasons 
### /search/chapters/:criteria/:chapters
Busca series según su número de temporadas (seasons) o capítulos (chapters), en base al criterio (criteria) establecido. Los criterios son los siguientes:
- lt: _less than_, estrictamente menor que (<).
- lte: _less than or equal_, menor o igual que (=<).
- eq: _equal_, igual que (==).
- gte: _greater or equal_, mayor o igual que (>=).
- gt: _greater than_, estrictamente mayor que (>).

```
GET http://localhost:3000/api/v1/search/chapters/gt/200
```

```
{
	error: false
	result_count: 2
	-result: [
		-{
			_id: 487
			show_url: http://subtitulos.es/show/487
			name: "Classic Doctor Who"
			base_url: http://subtitulos.es/classic-doctor-who/
			chapters: 377
			seasons: 19
		}
		-{
			_id: 41
			show_url: http://subtitulos.es/show/41
			name: "Two And a Half Men"
			base_url: http://subtitulos.es/two-and-a-half-men/
			chapters: 206
			seasons: 11
		}
	]
}
```

- error 0: interno.
- error 2: criterio no reconocido.

## Logs

NodeJS muestra por terminal la actividad que se está realizando contra el servidor.  
index_scraper.py guarda en /scrapers/logs sus logs de actividad, con las series que han sido insertadas, actualizadas e ignoradas cada vez que es ejecutado.  
title_scraper.py no guarda ningún tipo de log ni lo muestra por terminal.

## Legal
subtiREST está protegido por la licencia Apache 2.0. Tienes el derecho de usarlo para cualquier propósito, distribuirlo, modificarlo y distribuir versiones modificadas.

Sin embargo, este es un proyecto con fines educativos. Sergio Luis Para no se hace responsable de un mal uso por partes de terceros, estando considerada también la infracción de copyright o el abuso de subtiREST para degradación, de cualquier tipo, del servicio ofrecido por subtitulos.es.

Sergio Luis Para no está, de ninguna manera, relacionado con subtitulos.es, y todos los datos que se pueden obtener usando subtiREST son públicos en subtitulos.es.

## Consideraciones
El scraper del índice de subtitulos.es debe ser corrido regularmente para mantener la base de datos actualizada. Puedes añadir en sistemas GNU/Linux una entrada al cron con el correspondiente comando.  

```
0,30 * * * * python <subtiREST directory>/scrapers/index_scraper.py
```

El fichero scrapers.config está pensado para poder enganchar el scrapers de los títulos a cualquier BD MongoDB, y el servidor RPC a cualquier puerto, sin necesidad de tocar el código. Sin embargo, no es realmente usado en title_scraper.py, y en caso de querer que realmente funcione, habría que cambiar las correspondientes direcciones en /server/server.js y /server/helpers/utils.js