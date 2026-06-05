import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NbAlertModule,
  NbButtonModule,
  NbCardModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbToastrModule,
} from '@nebular/theme';

import { AuthRoutingModule } from './auth-routing.module';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [RegisterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NbCardModule,
    NbFormFieldModule,
    NbInputModule,
    NbIconModule,
    NbButtonModule,
    NbAlertModule,
    NbToastrModule,
    AuthRoutingModule,
  ],
})
export class AuthModule {}
