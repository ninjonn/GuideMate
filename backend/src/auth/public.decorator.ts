import { SetMetadata } from '@nestjs/common';

// Publikus vegpont jelolese, a guard ez alapjan atengedi.
// A kulcsot exportaljuk, hogy a guard ugyanazt a metadatat olvassa.
export const IS_PUBLIC_KEY = 'isPublic';
// @Public decorator, amit a controller metodusokra teszunk.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
