import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ActiveParamsType } from "src/types/active-params.type";
import { ProductType } from "src/types/product.type";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  constructor(private http: HttpClient) {}

  getBestProducts(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(environment.api + "products/best");
  }

  getProducts(params: ActiveParamsType): Observable<{
    totalCount: number;
    pages: number;
    items: ProductType[];
  }> {
    return this.http.get<{
      totalCount: number;
      pages: number;
      items: ProductType[];
    }>(environment.api + "products", { params: params });
  }

  getProduct(url: string): Observable<ProductType> {
    return this.http.get<ProductType>(environment.api + "products/" + url);
  }

  searchProducts(query: string): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(
      environment.api + "products/search?query=" + query
    );
  }
}
