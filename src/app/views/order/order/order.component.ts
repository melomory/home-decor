import { HttpErrorResponse } from "@angular/common/http";
import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { AuthService } from "src/app/core/auth/auth.service";
import { CartService } from "src/app/shared/services/cart.service";
import { OrderService } from "src/app/shared/services/order.service";
import { UserService } from "src/app/shared/services/user.service";
import { CartType } from "src/types/cart.type";
import { DefaultResponseType } from "src/types/default-response.type";
import { DeliveryType } from "src/types/delivery.type";
import { OrderType } from "src/types/order.type";
import { PaymentType } from "src/types/payment.type";
import { UserInfoType } from "src/types/user-info.type";

@Component({
  selector: "app-order",
  templateUrl: "./order.component.html",
  styleUrls: ["./order.component.scss"],
})
export class OrderComponent implements OnInit {
  cart: CartType | null = null;

  totalAmount: number = 0;
  totalCount: number = 0;
  deliveryType: DeliveryType = DeliveryType.delivery;
  deliveryTypes = DeliveryType;
  paymentTypes = PaymentType;

  orderForm = this.fb.group({
    firstName: ["", Validators.required],
    lastName: ["", Validators.required],
    fatherName: [""],
    phone: ["", Validators.required],
    paymentType: [PaymentType.cashToCourier, Validators.required],
    email: ["", [Validators.required, Validators.email]],
    street: [""],
    house: [""],
    entrance: [""],
    apartment: [""],
    comment: [""],
  });

  @ViewChild("popup") popup!: TemplateRef<ElementRef>;
  dialogRef: MatDialogRef<any> | null = null;

  constructor(
    private cartService: CartService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private orderService: OrderService,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.updateDeliveryTypeValidation();
  }

  ngOnInit(): void {
    this.cartService
      .getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.cart = data as CartType;
        if (!this.cart || (this.cart && this.cart.items.length === 0)) {
          this._snackBar.open("Корзина пустая");
          this.router.navigate(["/"]);
          return;
        }
        this.calculateTotal();
      });

    if (this.authService.getIsLoggedIn()) {
      this.userService
        .getUserInfo()
        .subscribe((data: UserInfoType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error) {
            throw new Error((data as DefaultResponseType).message);
          }

          const userInfo = data as UserInfoType;

          const paramsToUpdate = {
            firstName: userInfo.firstName ?? "",
            lastName: userInfo.lastName ?? "",
            fatherName: userInfo.fatherName ?? "",
            phone: userInfo.phone ?? "",
            paymentType: userInfo.paymentType ?? PaymentType.cashToCourier,
            email: userInfo.email ?? "",
            street: userInfo.street ?? "",
            house: userInfo.house ?? "",
            entrance: userInfo.entrance ?? "",
            apartment: userInfo.apartment ?? "",
            comment: "",
          };

          if (userInfo.deliveryType) {
            this.deliveryType = userInfo.deliveryType;
          }

          this.orderForm.setValue(paramsToUpdate);
        });
    }
  }

  calculateTotal() {
    this.totalAmount = 0;
    this.totalCount = 0;
    if (this.cart) {
      this.cart.items.forEach((item) => {
        this.totalAmount += item.quantity * item.product.price;
        this.totalCount += item.quantity;
      });
    }
  }

  changeDeliveryType(deliveryType: DeliveryType) {
    this.deliveryType = deliveryType;
    this.updateDeliveryTypeValidation();
  }

  updateDeliveryTypeValidation() {
    if (this.deliveryType === DeliveryType.delivery) {
      this.orderForm.get("street")?.setValidators(Validators.required);
      this.orderForm.get("house")?.setValidators(Validators.required);
    } else {
      this.orderForm.get("street")?.removeValidators(Validators.required);
      this.orderForm.get("house")?.removeValidators(Validators.required);

      this.orderForm.get("street")?.setValue("");
      this.orderForm.get("house")?.setValue("");
      this.orderForm.get("entrance")?.setValue("");
      this.orderForm.get("apartment")?.setValue("");
    }

    this.orderForm.get("street")?.updateValueAndValidity();
    this.orderForm.get("house")?.updateValueAndValidity();
  }

  createOrder() {
    if (
      this.orderForm.valid &&
      this.orderForm.value.firstName &&
      this.orderForm.value.lastName &&
      this.orderForm.value.phone &&
      this.orderForm.value.paymentType &&
      this.orderForm.value.email
    ) {
      const paramsObject: OrderType = {
        deliveryType: this.deliveryType,
        firstName: this.orderForm.value.firstName,
        lastName: this.orderForm.value.lastName,
        phone: this.orderForm.value.phone,
        paymentType: this.orderForm.value.paymentType,
        email: this.orderForm.value.email,
      };

      if (this.deliveryType === DeliveryType.delivery) {
        if (this.orderForm.value.street) {
          paramsObject.street = this.orderForm.value.street;
        }

        if (this.orderForm.value.house) {
          paramsObject.house = this.orderForm.value.house;
        }

        if (this.orderForm.value.entrance) {
          paramsObject.entrance = this.orderForm.value.entrance;
        }

        if (this.orderForm.value.apartment) {
          paramsObject.apartment = this.orderForm.value.apartment;
        }
      }

      if (this.orderForm.value.comment) {
        paramsObject.comment = this.orderForm.value.comment;
      }

      this.orderService.createOrder(paramsObject).subscribe({
        next: (data: OrderType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.dialogRef = this.dialog.open(this.popup);
          this.dialogRef.backdropClick().subscribe(() => {
            this.router.navigate(["/"]);
          });

          this.cartService.setCount(0);
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.message) {
            this._snackBar.open(errorResponse.error.message);
          } else {
            this._snackBar.open("Ошибка заказа");
          }
        },
      });
    } else {
      this.orderForm.markAllAsTouched();
      this._snackBar.open("Заполните необходимые поля");
    }
  }

  closePopup() {
    this.dialogRef?.close();
    this.router.navigate(["/"]);
  }
}
