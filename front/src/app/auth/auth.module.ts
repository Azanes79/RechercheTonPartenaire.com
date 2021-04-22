import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { MaterialModule } from '../_sared/material/material.module';
import { RegisterComponent } from './register/register.component';


@NgModule({
  declarations: [AuthComponent, LoginComponent, RegisterComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    MaterialModule
  ]
})
export class AuthModule { }