import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UserRoutingModule } from "./user-routing.module";
import { SignupComponent } from "./signup/signup.component";
import { LoginComponent } from "./login/login.component";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [SignupComponent, LoginComponent],
  imports: [CommonModule, ReactiveFormsModule, UserRoutingModule, SharedModule],
})
export class UserModule {}
