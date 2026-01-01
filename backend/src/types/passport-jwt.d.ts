// Minimalis tipus deklaracio a passport-jwt-hez, hogy ne legyen implicit any.
declare module 'passport-jwt' {
  // A request alapjan adja vissza a token stringet vagy null-t.
  export type JwtFromRequestFunction = (req: unknown) => string | null;

  // Helper a bearer token kiolvasasahoz.
  export namespace ExtractJwt {
    function fromAuthHeaderAsBearerToken(): JwtFromRequestFunction;
  }

  // Strategy opciok, ami a jwt ellenorzeshez szukseges.
  export interface StrategyOptions {
    jwtFromRequest: JwtFromRequestFunction;
    secretOrKey: string;
    ignoreExpiration?: boolean;
  }

  // A Strategy osztaly, amit a PassportStrategy becsomagol.
  export class Strategy {
    constructor(
      options: StrategyOptions,
      verify?: (...args: unknown[]) => void,
    );
  }
}
