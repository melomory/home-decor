import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { DefaultResponseType } from "src/types/default-response.type";
import { LoginResponseType } from "src/types/login-response.type";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public accessTokenKey: string = "accessToken";
  public refreshTokenKey: string = "refreshToken";
  public userIdKey: string = "userId";

  public isLogged$: Subject<boolean> = new Subject<boolean>();
  private isLogged: boolean = false;

  constructor(private http: HttpClient) {
    this.isLogged = !!localStorage.getItem(this.accessTokenKey);
  }

  signup(
    email: string,
    password: string,
    passwordRepeat: string
  ): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(
      environment.api + "signup",
      {
        email,
        password,
        passwordRepeat,
      }
    );
  }

  login(
    email: string,
    password: string,
    rememberMe: boolean
  ): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(
      environment.api + "login",
      {
        email,
        password,
        rememberMe,
      }
    );
  }

  logout(): Observable<DefaultResponseType> {
    const tokens = this.getTokens();
    if (tokens && tokens.refreshToken) {
      return this.http.post<DefaultResponseType>(environment.api + "logout", {
        refreshToken: tokens.refreshToken,
      });
    }

    throw throwError(() => "Cannot find token");
  }

  public getIsLoggedIn(): boolean {
    return this.isLogged;
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isLogged = true;
    this.isLogged$.next(true);
  }

  public removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isLogged = false;
    this.isLogged$.next(false);
  }

  public getTokens(): {
    accessToken: string | null;
    refreshToken: string | null;
  } {
    return {
      accessToken: localStorage.getItem(this.accessTokenKey),
      refreshToken: localStorage.getItem(this.refreshTokenKey),
    };
  }

  get userId(): string | null {
    return localStorage.getItem(this.userIdKey);
  }

  set userId(userId: string | null) {
    if (userId) {
      localStorage.setItem(this.userIdKey, userId);
    } else {
      localStorage.removeItem(this.userIdKey);
    }
  }

  refresh(): Observable<DefaultResponseType | LoginResponseType> {
    const tokens = this.getTokens();

    if (tokens && tokens.refreshToken) {
      this.http.post<DefaultResponseType | LoginResponseType>(
        environment.api + "refresh",
        {
          refreshToken: tokens.refreshToken,
        }
      );
    }

    throw throwError(() => "Can not use token");
  }
}
