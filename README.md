# BeatFlow

Plataforma multimedia de tendencias y analítica musical construida sobre **Angular**, **ngx-admin** y **Nebular UI**.

## Descripción

BeatFlow es un frontend enfocado en la visualización de tendencias musicales, exploración de artistas y análisis interactivo de hábitos de escucha. El proyecto adapta la base estructural de **ngx-admin** para construir dashboards visuales, métricas musicales y una experiencia moderna orientada al descubrimiento de contenido multimedia.

A diferencia de una plataforma de streaming tradicional, BeatFlow se centra en:

- tendencias musicales,
- visualización de datos,
- exploración interactiva,
- estadísticas personalizadas,
- dashboards analíticos.

## Información general

| Campo | Información |
| --- | --- |
| Nombre del proyecto | BeatFlow |
| Tipo de proyecto | Plataforma multimedia |
| Enfoque | Tendencias y analítica social |
| Plataforma base | Angular ngx-admin |
| Metodología | Scrum + Git Flow |
| Framework principal | Angular |
| UI base | Nebular + ngx-admin |

## Equipo de desarrollo

- José de Jesús Almanza Contreras
- Jossue Amador Ynfante
- Pablo Emilio Alonso Romero
- Leonardo Gael Durán Torres
- Victor Hassiel Ávila Monjarás

## Objetivo general

Desarrollar una plataforma multimedia interactiva que permita visualizar tendencias musicales, explorar artistas y analizar hábitos de escucha mediante dashboards dinámicos basados en ngx-admin.

## Objetivos específicos

- Adaptar la arquitectura de ngx-admin a una plataforma musical.
- Implementar dashboards interactivos relacionados con tendencias musicales.
- Mostrar estadísticas visuales sobre canciones y artistas.
- Permitir exploración musical por géneros y estados de ánimo.
- Gestionar playlists y canciones favoritas.
- Aplicar metodología Scrum durante el desarrollo.
- Utilizar Git Flow para control de versiones.

## Público objetivo

BeatFlow está dirigido a:

- jóvenes consumidores de música digital,
- usuarios interesados en tendencias musicales,
- personas que disfrutan dashboards visuales,
- usuarios interesados en estadísticas musicales,
- consumidores de contenido multimedia moderno.

## Tecnologías utilizadas

### Frontend

- Angular
- TypeScript
- SCSS
- Nebular UI
- ngx-admin

### Gestión del proyecto

- Scrum
- Git Flow
- GitHub

### API externa

- Last.fm API

## Funcionalidades principales

### Autenticación

- Registro de usuarios
- Inicio de sesión
- Gestión de perfil

### Dashboard musical

- Canciones en tendencia
- Artistas más escuchados
- Géneros populares
- Estadísticas visuales

### Exploración musical

- Buscar canciones
- Buscar artistas
- Explorar géneros
- Descubrir música por moods

### Gestión personal

- Crear playlists
- Guardar favoritos
- Editar perfil

### Analítica

- Tiempo de escucha
- Géneros favoritos
- Tendencias personales
- Actividad semanal

## Módulos del sistema

| Módulo | Función |
| --- | --- |
| Auth | Gestión de usuarios |
| Dashboard | Visualización de tendencias |
| Analytics | Estadísticas musicales |
| Explore | Descubrimiento musical |
| Playlist | Administración de playlists |
| Profile | Configuración de usuario |

## Historias de usuario

| ID | Historia | Prioridad |
| --- | --- | --- |
| HU-01 | Registrar usuario | Alta |
| HU-02 | Iniciar sesión | Alta |
| HU-03 | Ver canciones en tendencia | Alta |
| HU-04 | Ver artistas populares | Media |
| HU-05 | Buscar canciones y artistas | Alta |
| HU-06 | Crear playlist | Alta |
| HU-07 | Guardar favoritos | Media |
| HU-08 | Explorar moods | Media |
| HU-09 | Ver estadísticas personales | Media |
| HU-10 | Editar perfil | Baja |

## Arquitectura general

### Frontend

Angular + ngx-admin + Nebular UI.

### Datos externos

Información musical obtenida mediante Last.fm API.

### Visualización

Dashboards y gráficas reutilizadas de ngx-admin.

## Estructura de carpetas

```text
beatflow/
├── src/
├── app/
│   ├── core/
│   ├── shared/
│   ├── modules/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── analytics/
│   │   ├── explore/
│   │   ├── playlists/
│   │   └── profile/
│   ├── services/
│   ├── models/
│   ├── components/
│   └── layouts/
├── assets/
├── environments/
└── styles/
```

## Requerimientos no funcionales

- Responsive Design compatible con dispositivos móviles.
- Rendimiento optimizado para carga rápida de dashboards.
- Escalabilidad mediante arquitectura modular.
- Usabilidad con interfaz intuitiva.
- Accesibilidad con navegación clara y visual.

## Flujo de trabajo

BeatFlow sigue un flujo ágil basado en Scrum y Git Flow.

### Estados del tablero

- Backlog
- Sprint To Do
- In Progress
- Review
- Done

### Etiquetas sugeridas

- feature
- bug
- documentation
- sprint-1
- sprint-2
- analytics
- frontend

## Testing

Pruebas consideradas para el frontend:

- Validación de formularios
- Navegación entre módulos
- Renderizado de dashboards
- Visualización de tendencias
- Consumo correcto de APIs

## Despliegue

La arquitectura de despliegue contempla al usuario consumiendo el frontend Angular, el cual se conecta a la API externa de Last.fm para obtener datos musicales.

## Visión del producto

BeatFlow busca convertirse en una plataforma multimedia moderna enfocada en tendencias musicales y analítica visual, ofreciendo una experiencia innovadora basada en dashboards interactivos y descubrimiento musical personalizado.

## Conclusión

BeatFlow representa una propuesta moderna e innovadora dentro del entretenimiento multimedia, aprovechando tecnologías actuales y dashboards interactivos para crear una experiencia musical diferente a las plataformas tradicionales. El proyecto permite aplicar metodologías ágiles, reutilización de componentes y trabajo colaborativo mediante Scrum y Git Flow.
