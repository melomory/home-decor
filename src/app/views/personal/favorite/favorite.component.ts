import { Component, OnInit } from "@angular/core";
import { CartService } from "src/app/shared/services/cart.service";
import { FavoriteService } from "src/app/shared/services/favorite.service";
import { environment } from "src/environments/environment";
import { CartType } from "src/types/cart.type";
import { DefaultResponseType } from "src/types/default-response.type";
import { FavoriteType } from "src/types/favorite.type";

@Component({
  selector: "app-favorite",
  templateUrl: "./favorite.component.html",
  styleUrls: ["./favorite.component.scss"],
})
export class FavoriteComponent implements OnInit {
  products: FavoriteType[] = [];
  serverStaticPath = environment.serverStaticPath;

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.favoriteService
      .getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }

        this.products = data as FavoriteType[];

        this.cartService
          .getCart()
          .subscribe((data: CartType | DefaultResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }

            const cart = data as CartType;

            cart.items.forEach((item) => {
              const product = this.products.find(
                (product) => product.id === item.product.id
              );

              if (product) {
                product.countInCart = item.quantity;
                product.isInCart = true;
              }
            });
          });
      });
  }

  removeFromFavorites(id: string) {
    this.favoriteService
      .removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          // ...
          throw new Error(data.message);
        }

        this.products = this.products.filter((item) => item.id !== id);
      });
  }

  removeFromCart(product: FavoriteType) {
    this.cartService
      .updateCart(product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        product.countInCart = undefined;
        product.isInCart = false;
      });
  }

  addToCart(product: FavoriteType) {
    this.cartService
      .updateCart(product.id, product.countInCart ?? 1)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        const cart = data as CartType;

        cart.items.forEach((item) => {
          const product = this.products.find(
            (product) => product.id === item.product.id
          );

          if (product) {
            product.countInCart = item.quantity;
            product.isInCart = true;
          }
        });
      });
  }

  updateCount(product: FavoriteType, value: number) {
    if (product.isInCart) {
      this.cartService
        .updateCart(product.id, value)
        .subscribe((data: CartType | DefaultResponseType) => {});
    }

    product.countInCart = value;
  }
}
