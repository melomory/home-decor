import { HttpErrorResponse } from "@angular/common/http";
import { Component, HostListener, Input, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { AuthService } from "src/app/core/auth/auth.service";
import { CategoryWithTypeType } from "src/types/category-with-type.type";
import { CategoryType } from "src/types/category.type";
import { DefaultResponseType } from "src/types/default-response.type";
import { CartService } from "../../services/cart.service";
import { ProductService } from "../../services/product.service";
import { ProductType } from "src/types/product.type";
import { environment } from "src/environments/environment";
import { FormControl } from "@angular/forms";
import { debounceTime } from "rxjs";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  isLogged: boolean = false;
  showedSearch: boolean = false;
  searchField = new FormControl();

  @Input() categories: CategoryWithTypeType[] = [];

  count: number = 0;

  // searchValue: string = "";
  products: ProductType[] = [];
  serverStaticPath: string = environment.serverStaticPath;

  constructor(
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private cartService: CartService,
    private productService: ProductService
  ) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.searchField.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      if (value && value.length > 2) {
        this.productService
          .searchProducts(value)
          .subscribe((data: ProductType[]) => {
            this.showedSearch = true;
            this.products = data;
          });
      } else {
        this.products = [];
      }
    });

    this.getCountCart();

    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
      this.getCountCart();
    });

    this.cartService.count$.subscribe((count) => {
      this.count = count;
    });
  }

  getCountCart(): void {
    this.cartService
      .getCartCount()
      .subscribe((data: { count: number } | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.count = (data as { count: number }).count;
      });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (data: DefaultResponseType) => this.doLogout(),
      error: (errorResponse: HttpErrorResponse) => {
        // if (errorResponse.error && errorResponse.error.message) {
        //   this._snackBar.open(errorResponse.error.message);
        // } else {
        //   this._snackBar.open("Ошибка выхода из системы");
        // }
        this.doLogout();
      },
    });
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open("Вы вышли из системы");
    this.router.navigate(["/"]);
  }

  // changedSearchValue(newValue: string) {
  //   this.searchValue = newValue;

  //   if (this.searchValue && this.searchValue.length > 2) {
  //     this.productService
  //       .searchProducts(this.searchValue)
  //       .subscribe((data: ProductType[]) => {
  //         this.showedSearch = true;
  //         this.products = data;
  //       });
  //   } else {
  //     this.products = [];
  //   }
  // }

  selectProduct(url: string) {
    this.router.navigate(["/product/" + url]);
    // this.searchValue = "";
    this.searchField.setValue("");
    this.products = [];
  }

  // changeShowedSearch(value: boolean) {
  //   setTimeout(() => {
  //     this.showedSearch = value;
  //   }, 100);
  // }

  @HostListener("document:click", ["$event"])
  click(event: Event) {
    if (
      this.showedSearch &&
      (event.target as HTMLElement).className.indexOf("search-product") === -1
    ) {
      this.showedSearch = false;
    }
  }
}
