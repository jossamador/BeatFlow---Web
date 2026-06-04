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

@Injectable()
export class LastfmHttpInterceptor implements HttpInterceptor {
  constructor(private toastrService: NbToastrService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const request = this.attachLastFmApiKey(req);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleHttpError(error);
        return throwError(() => error);
      }),
    );
  }

  private attachLastFmApiKey(req: HttpRequest<unknown>): HttpRequest<unknown> {
    const isLastFmRequest = req.url.includes(environment.lastFm.baseUrl);

    if (!isLastFmRequest || !environment.lastFm.apiKey) {
      return req;
    }

    const params = req.params
      .set('api_key', environment.lastFm.apiKey)
      .set('format', 'json');

    return req.clone({ params });
  }

  private handleHttpError(error: HttpErrorResponse): void {
    const message = this.resolveErrorMessage(error);

    this.toastrService.danger(message, 'BeatFlow', { duration: 5000 });
    // Keep trace in dev tools for diagnostics while preserving UX.
    // eslint-disable-next-line no-console
    console.error('[HTTP Error]', error);
  }

  private resolveErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servicio musical. Verifica tu red.';
    }

    if (error.status >= 500) {
      return 'El servicio musical no esta disponible temporalmente. Intenta de nuevo.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'No tienes permisos para consultar este recurso musical.';
    }

    if (error.status === 404) {
      return 'No se encontro la informacion solicitada en Last.fm.';
    }

    return 'Ocurrio un error al consultar datos musicales.';
  }
}
