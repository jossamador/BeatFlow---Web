import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

import { BeatflowAuthService } from '../../../@core/services';

@Component({
  selector: 'ngx-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm = this.formBuilder.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private toastrService: NbToastrService,
    private router: Router,
    private authService: BeatflowAuthService,
  ) {}

  get nameControl(): AbstractControl | null {
    return this.registerForm.get('name');
  }

  get emailControl(): AbstractControl | null {
    return this.registerForm.get('email');
  }

  get passwordControl(): AbstractControl | null {
    return this.registerForm.get('password');
  }

  submit(): void {
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid || this.isSubmitting) {
      return;
    }

    const email = this.emailControl?.value?.trim().toLowerCase();
    const password = this.passwordControl?.value || '';

    if (!email || !password) {
      return;
    }

    this.isSubmitting = true;

    this.authService.register({
      email,
      password,
      name: this.nameControl?.value || undefined,
    })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastrService.success('Tu cuenta fue creada correctamente.', 'Registro completado', {
            duration: 4000,
          });
          this.registerForm.reset();
          void this.router.navigate(['/auth/login']);
        },
        error: (error: HttpErrorResponse) => this.handleRegisterError(error),
      });
  }

  handleRegisterError(error: HttpErrorResponse): void {
    this.isSubmitting = false;

    if (error.status === 409) {
      this.emailControl?.setErrors({
        ...this.emailControl.errors,
        duplicateEmail: true,
      });
      this.emailControl?.markAsTouched();
      this.toastrService.warning('Usa otro correo o inicia sesion con esa cuenta.', 'Correo ya registrado', {
        duration: 4500,
      });
    }
  }

  controlHasError(controlName: 'name' | 'email' | 'password', errorName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }
}
