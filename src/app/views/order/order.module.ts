import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { OrderRoutingModule } from "./order-routing.module";
import { CartComponent } from "./cart/cart.component";
import { OrderComponent } from "./order/order.component";
import { SharedModule } from "src/app/shared/shared.module";
import { CarouselModule } from "ngx-owl-carousel-o";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";

@NgModule({
  declarations: [CartComponent, OrderComponent],
  imports: [
    CommonModule,
    OrderRoutingModule,
    SharedModule,
    CarouselModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
})
export class OrderModule {}
