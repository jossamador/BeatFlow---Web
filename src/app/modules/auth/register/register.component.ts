import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

interface RegisteredUser {
  email: string;
  createdAt: string;
}

@Component({
  selector: 'ngx-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  readonly storageKey = 'beatflow-registered-users';

  registerForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email, this.uniqueEmailValidator()]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(
    private formBuilder: FormBuilder,
    private toastrService: NbToastrService,
    private router: Router,
  ) {}

  get emailControl(): AbstractControl | null {
    return this.registerForm.get('email');
  }

  get passwordControl(): AbstractControl | null {
    return this.registerForm.get('password');
  }

  submit(): void {
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      return;
    }

    const email = this.emailControl?.value?.trim().toLowerCase();

    if (!email || this.isRegisteredEmail(email)) {
      this.emailControl?.setErrors({ duplicateEmail: true });
      return;
    }

    this.saveUser({
      email,
      createdAt: new Date().toISOString(),
    });

    this.toastrService.success('Tu cuenta fue creada correctamente.', 'Registro completado', {
      duration: 4000,
    });

    this.registerForm.reset();
    void this.router.navigate(['/dashboard']);
  }

  controlHasError(controlName: 'email' | 'password', errorName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }

  private uniqueEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = (control.value ?? '').trim().toLowerCase();

      if (!email) {
        return null;
      }

      return this.isRegisteredEmail(email) ? { duplicateEmail: true } : null;
    };
  }

  private isRegisteredEmail(email: string): boolean {
    return this.getRegisteredUsers().some((user) => user.email === email);
  }

  private saveUser(user: RegisteredUser): void {
    const users = this.getRegisteredUsers();
    users.push(user);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  private getRegisteredUsers(): RegisteredUser[] {
    const rawUsers = localStorage.getItem(this.storageKey);

    if (!rawUsers) {
      return [];
    }

    try {
      const parsedUsers = JSON.parse(rawUsers) as RegisteredUser[];
      return Array.isArray(parsedUsers) ? parsedUsers : [];
    } catch {
      return [];
    }
  }
}
