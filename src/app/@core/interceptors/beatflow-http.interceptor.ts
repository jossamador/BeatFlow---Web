import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { NbToastrService } from '@nebular/theme';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { BeatflowSession } from '../services/beatflow-api.models';

@Injectable()
export class BeatflowHttpInterceptor implements HttpInterceptor {
  private readonly sessionKey = 'bf_session';

  constructor(private toastrService: NbToastrService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const request = this.attachAuthorization(req);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (this.isBeatflowApiRequest(req.url) && !this.isFeatureHandledError(req, error)) {
          this.handleHttpError(error);
        }

        return throwError(() => error);
      }),
    );
  }

  private attachAuthorization(req: HttpRequest<unknown>): HttpRequest<unknown> {
    const token = this.getStoredToken();

    if (!this.isBeatflowApiRequest(req.url) || !token) {
      return req;
    }

    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private getStoredToken(): string | null {
    const rawSession = localStorage.getItem(this.sessionKey);

    if (!rawSession) {
      return null;
    }

    try {
      return (JSON.parse(rawSession) as BeatflowSession).token || null;
    } catch {
      return null;
    }
  }

  private isBeatflowApiRequest(url: string): boolean {
    return url.startsWith(environment.beatflowApi.baseUrl);
  }

  private isFeatureHandledError(req: HttpRequest<unknown>, error: HttpErrorResponse): boolean {
    return error.status === 409 && req.url.endsWith('/api/auth/register');
  }

  private handleHttpError(error: HttpErrorResponse): void {
    this.toastrService.danger(this.resolveErrorMessage(error), 'BeatFlow API', { duration: 5000 });
    // eslint-disable-next-line no-console
    console.error('[BeatFlow API Error]', error);
  }

  private resolveErrorMessage(error: HttpErrorResponse): string {
    const apiMessage = this.getApiMessage(error);

    if (apiMessage) {
      return apiMessage;
    }

    if (error.status === 0) {
      return 'No se pudo conectar con BeatFlow API. Verifica tu red.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Tu sesion expiro o no tienes permisos para esta accion.';
    }

    if (error.status === 404) {
      return 'No se encontro informacion para esta consulta.';
    }

    if (error.status === 409) {
      return 'Ya existe un registro con esos datos.';
    }

    if (error.status >= 500) {
      return 'BeatFlow API no esta disponible temporalmente. Intenta de nuevo.';
    }

    return 'Ocurrio un error al consultar BeatFlow API.';
  }

  private getApiMessage(error: HttpErrorResponse): string | null {
    const body = error.error;

    if (!body) {
      return null;
    }

    if (typeof body === 'string') {
      return body;
    }

    if (Array.isArray(body.message)) {
      return body.message.join(' ');
    }

    return typeof body.message === 'string' ? body.message : null;
  }
}
