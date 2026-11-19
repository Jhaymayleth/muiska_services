// Especificación OpenAPI de los flujos principales de MUISKA.
// Se sirve en /api/docs (Swagger UI) y /api/docs.json.
export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "MUISKA API",
    version: "0.1.0",
    description:
      "API del marketplace MUISKA: publicaciones, categorías, favoritos, chat, reseñas, verificaciones y administración.",
  },
  servers: [{ url: "/api", description: "API" }],
  tags: [
    { name: "Auth", description: "Registro, login y perfil" },
    { name: "Publications", description: "Publicaciones y búsqueda" },
    { name: "Reviews", description: "Reseñas de publicaciones" },
    { name: "Categories", description: "Categorías" },
    { name: "Favorites", description: "Favoritos del usuario" },
    { name: "Neighborhoods", description: "Barrios y geolocalización" },
    { name: "Chat", description: "Conversaciones y mensajes" },
    { name: "Notifications", description: "Notificaciones" },
    { name: "Admin", description: "Panel de administración" },
    { name: "Health", description: "Estado del servicio" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { message: { type: "string" } },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["user", "verifier", "admin"] },
          neighborhood_id: { type: "integer", nullable: true },
          bio: { type: "string", nullable: true },
          lat: { type: "number", nullable: true },
          lng: { type: "number", nullable: true },
          avg_rating: { type: "number" },
          total_reviews: { type: "integer" },
          is_verified_badge: { type: "boolean" },
          profile_image_url: { type: "string", nullable: true },
        },
      },
      Publication: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          category: { type: "string" },
          images: { type: "array", items: { type: "string" } },
          location: { type: "string" },
          contact_method: { type: "string" },
          status: { type: "string", enum: ["active", "sold", "inactive"] },
          moderation_status: { type: "string", enum: ["pending", "approved", "rejected"] },
          user_id: { type: "string", format: "uuid" },
          user_name: { type: "string" },
          distance_meters: {
            type: "number",
            description: "Distancia al usuario cuando se filtra por lat/lng/radius",
          },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Review: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string", nullable: true },
          reviewer_id: { type: "string", format: "uuid" },
          reviewer_name: { type: "string" },
          reviewer_avatar: { type: "string", nullable: true },
          created_at: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  phone: { type: "string" },
                  neighborhoodId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Usuario creado" },
          400: { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          429: { description: "Demasiados registros" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesión",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Token JWT y usuario" },
          401: { description: "Credenciales inválidas" },
          429: { description: "Demasiados intentos" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Perfil del usuario autenticado",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Usuario", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          401: { description: "No autenticado" },
        },
      },
      put: {
        tags: ["Auth"],
        summary: "Actualizar perfil (parcial)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  bio: { type: "string" },
                  phone: { type: "string" },
                  whatsapp: { type: "string" },
                  neighborhoodId: { type: "integer" },
                  lat: { type: "number" },
                  lng: { type: "number" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Perfil actualizado" }, 401: { description: "No autenticado" } },
      },
      delete: {
        tags: ["Auth"],
        summary: "Eliminar la cuenta",
        security: [{ bearerAuth: [] }],
        responses: { 204: { description: "Cuenta eliminada" }, 401: { description: "No autenticado" } },
      },
    },
    "/publications": {
      get: {
        tags: ["Publications"],
        summary: "Listar publicaciones activas y aprobadas",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12, maximum: 50 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "location", in: "query", schema: { type: "string" } },
          { name: "lat", in: "query", schema: { type: "number", minimum: -90, maximum: 90 } },
          { name: "lng", in: "query", schema: { type: "number", minimum: -180, maximum: 180 } },
          { name: "radius", in: "query", description: "Radio en km", schema: { type: "number", enum: [1, 3, 5, 10] } },
        ],
        responses: {
          200: {
            description: "Listado paginado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Publication" } },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        totalPages: { type: "integer" },
                        total: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Publications"],
        summary: "Crear publicación (multipart)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["title", "price"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  category: { type: "string" },
                  location: { type: "string" },
                  contactMethod: { type: "string" },
                  images: { type: "array", items: { type: "string", format: "binary" } },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Publicación creada (queda pendiente de moderación)" }, 401: { description: "No autenticado" } },
      },
    },
    "/publications/mine": {
      get: {
        tags: ["Publications"],
        summary: "Mis publicaciones",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Listado del usuario" }, 401: { description: "No autenticado" } },
      },
    },
    "/publications/{id}": {
      get: {
        tags: ["Publications"],
        summary: "Detalle de publicación",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Publicación", content: { "application/json": { schema: { $ref: "#/components/schemas/Publication" } } } },
          404: { description: "No encontrada" },
        },
      },
      put: {
        tags: ["Publications"],
        summary: "Actualizar publicación propia",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Actualizada" }, 403: { description: "No es el dueño" } },
      },
      delete: {
        tags: ["Publications"],
        summary: "Eliminar publicación propia",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 204: { description: "Eliminada" }, 403: { description: "No es el dueño" } },
      },
    },
    "/publications/{publicationId}/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "Reseñas de una publicación",
        parameters: [{ name: "publicationId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Reseñas y media",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reviews: { type: "array", items: { $ref: "#/components/schemas/Review" } },
                    average: { type: "number" },
                    total: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Reviews"],
        summary: "Crear o actualizar mi reseña",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "publicationId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rating"],
                properties: {
                  rating: { type: "integer", minimum: 1, maximum: 5 },
                  comment: { type: "string", maxLength: 1000, nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Reseña guardada" },
          403: { description: "No puedes reseñar tu propia publicación" },
          404: { description: "Publicación no disponible" },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "Listar categorías",
        responses: { 200: { description: "Categorías" } },
      },
    },
    "/favorites": {
      get: {
        tags: ["Favorites"],
        summary: "Mis favoritos",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Listado paginado" }, 401: { description: "No autenticado" } },
      },
    },
    "/favorites/{publicationId}/toggle": {
      post: {
        tags: ["Favorites"],
        summary: "Añadir o quitar de favoritos",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "publicationId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Estado de favorito" } },
      },
    },
    "/neighborhoods/search": {
      get: {
        tags: ["Neighborhoods"],
        summary: "Buscar barrios por nombre",
        parameters: [{ name: "q", in: "query", required: true, schema: { type: "string", minLength: 2 } }],
        responses: { 200: { description: "Barrios coincidentes" } },
      },
    },
    "/neighborhoods/nearby": {
      get: {
        tags: ["Neighborhoods"],
        summary: "Barrios cercanos a unas coordenadas",
        parameters: [
          { name: "lat", in: "query", required: true, schema: { type: "number" } },
          { name: "lng", in: "query", required: true, schema: { type: "number" } },
          { name: "radius", in: "query", schema: { type: "number" } },
        ],
        responses: { 200: { description: "Barrios cercanos" } },
      },
    },
    "/users/{id}/profile": {
      get: {
        tags: ["Auth"],
        summary: "Perfil público de un vendedor",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Perfil, estadísticas y publicaciones activas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    profile: { $ref: "#/components/schemas/User" },
                    stats: { type: "object" },
                    publications: { type: "array", items: { $ref: "#/components/schemas/Publication" } },
                  },
                },
              },
            },
          },
          404: { description: "No encontrado" },
        },
      },
    },
    "/conversations": {
      get: {
        tags: ["Chat"],
        summary: "Mis conversaciones",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Conversaciones" } },
      },
      post: {
        tags: ["Chat"],
        summary: "Crear conversación sobre una publicación",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["publicationId", "sellerId"],
                properties: {
                  publicationId: { type: "string", format: "uuid" },
                  sellerId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Conversación creada" } },
      },
    },
    "/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Mis notificaciones",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Notificaciones" } },
      },
    },
    "/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Estadísticas del panel",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Estadísticas" }, 403: { description: "Requiere rol admin" } },
      },
    },
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Estado del servicio y de la base de datos",
        responses: { 200: { description: "OK" }, 503: { description: "Base de datos no disponible" } },
      },
    },
  },
};
