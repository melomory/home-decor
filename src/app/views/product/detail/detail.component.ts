import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";
import { subscribe } from "diagnostics_channel";
import { OwlOptions } from "ngx-owl-carousel-o";
import { AuthService } from "src/app/core/auth/auth.service";
import { CartService } from "src/app/shared/services/cart.service";
import { FavoriteService } from "src/app/shared/services/favorite.service";
import { ProductService } from "src/app/shared/services/product.service";
import { environment } from "src/environments/environment";
import { CartType } from "src/types/cart.type";
import { DefaultResponseType } from "src/types/default-response.type";
import { FavoriteType } from "src/types/favorite.type";
import { ProductType } from "src/types/product.type";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class DetailComponent implements OnInit {
  count: number = 1;
  recommendedProducts: ProductType[] = [];
  product!: ProductType;
  serverStaticPath = environment.serverStaticPath;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 24,
    dots: false,
    navSpeed: 700,
    navText: ["", ""],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 3,
      },
      940: {
        items: 4,
      },
    },
    nav: false,
  };

  constructor(
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.productService
        .getProduct(params["url"])
        .subscribe((data: ProductType) => {
          this.product = data;

          this.cartService
            .getCart()
            .subscribe((cartData: CartType | DefaultResponseType) => {
              if ((cartData as DefaultResponseType).error !== undefined) {
                throw new Error((cartData as DefaultResponseType).message);
              }

              const cartDataResponse = cartData as CartType;
              if (cartDataResponse) {
                const productInCart = cartDataResponse.items.find(
                  (item) => item.product.id === this.product.id
                );

                if (productInCart) {
                  this.product.countInCart = productInCart.quantity;
                  this.count = this.product.countInCart;
                }
              }
            });

          if (this.authService.getIsLoggedIn()) {
            this.favoriteService
              .getFavorites()
              .subscribe((data: FavoriteType[] | DefaultResponseType) => {
                if ((data as DefaultResponseType).error !== undefined) {
                  const error = (data as DefaultResponseType).message;
                  throw new Error(error);
                }

                const products = data as FavoriteType[];
                const currentProductExists = products.find(
                  (item) => item.id === this.product.id
                );
                if (currentProductExists) {
                  this.product.isInFavorite = true;
                }
              });
          }
        });
    });

    this.productService.getBestProducts().subscribe((data: ProductType[]) => {
      this.recommendedProducts = data;
    });
  }

  updateCount(value: number) {
    this.count = value;

    if (this.product.countInCart) {
      this.cartService
        .updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          this.product.countInCart = this.count;
        });
    }
  }

  addToCart() {
    this.cartService
      .updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.product.countInCart = this.count;
      });
  }

  removeFromCart() {
    this.cartService
      .updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        this.product.countInCart = 0;
        this.count = 1;
      });
  }

  updateFavorite() {
    if (!this.authService.getIsLoggedIn()) {
      this._snackBar.open(
        "Для добавления в избранное необходимо авторизоваться"
      );

      return;
    }

    if (this.product.isInFavorite) {
      this.favoriteService
        .removeFavorite(this.product.id)
        .subscribe((data: DefaultResponseType) => {
          if (data.error) {
            // ...
            throw new Error(data.message);
          }

          this.product.isInFavorite = false;
        });
    } else {
      this.favoriteService
        .addFavorite(this.product.id)
        .subscribe((data: FavoriteType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.product.isInFavorite = true;
        });
    }
  }
}
