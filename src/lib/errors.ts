export class AppError extends Error {
  constructor(public readonly status: number, public readonly code: string, message?: string) {
    super(message ?? code);
  }
}
export const unauthorized = () => new AppError(401, "UNAUTHORIZED", "Authentification requise");
export const forbidden = () => new AppError(403, "FORBIDDEN", "Accès refusé");
export const notFound = () => new AppError(404, "NOT_FOUND", "Ressource introuvable");