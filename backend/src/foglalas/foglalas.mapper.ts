import { BadRequestException } from '@nestjs/common';
import { CreateFoglalasDto } from './dto/create-foglalas.dto';
import { UpdateFoglalasDto } from './dto/update-foglalas.dto';
import { FoglalasListItem } from './foglalas.types';

export type FoglalasRecord = {
  foglalas_id: number;
  foglalas_tipus: string;
  indulasi_hely: string;
  erkezesi_hely: string;
  indulasi_ido: Date;
  erkezesi_ido: Date;
  jaratszam: string | null;
  hely: string | null;
  cim: string | null;
  kezdo_datum: Date | null;
  veg_datum: Date | null;
};

const TRAVEL_TYPES = new Set(['repulo', 'busz', 'vonat', 'auto']);

const isTravelType = (
  tipus: string,
): tipus is 'repulo' | 'busz' | 'vonat' | 'auto' => TRAVEL_TYPES.has(tipus);

const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

export const mapCreateDtoToData = (
  dto: CreateFoglalasDto,
): {
  foglalas_tipus: string;
  indulasi_hely: string;
  erkezesi_hely: string;
  indulasi_ido: Date;
  erkezesi_ido: Date;
  jaratszam: string | null;
  hely: string | null;
  cim: string | null;
  kezdo_datum: Date | null;
  veg_datum: Date | null;
} => {
  if (isTravelType(dto.tipus)) {
    if (
      !dto.indulasi_hely ||
      !dto.erkezesi_hely ||
      !dto.indulasi_ido ||
      !dto.erkezesi_ido
    ) {
      throw new BadRequestException('Hianyzo utazasi adatok.');
    }
    return {
      foglalas_tipus: dto.tipus,
      indulasi_hely: dto.indulasi_hely,
      erkezesi_hely: dto.erkezesi_hely,
      indulasi_ido: new Date(dto.indulasi_ido),
      erkezesi_ido: new Date(dto.erkezesi_ido),
      jaratszam: dto.jaratszam ?? null,
      hely: null,
      cim: null,
      kezdo_datum: null,
      veg_datum: null,
    };
  }

  if (!dto.hely || !dto.cim || !dto.kezdo_datum || !dto.veg_datum) {
    throw new BadRequestException('Hianyzo szallas adatok.');
  }

  return {
    foglalas_tipus: 'szallas',
    indulasi_hely: dto.hely,
    erkezesi_hely: dto.cim,
    indulasi_ido: new Date(dto.kezdo_datum),
    erkezesi_ido: new Date(dto.veg_datum),
    jaratszam: null,
    hely: dto.hely,
    cim: dto.cim,
    kezdo_datum: new Date(dto.kezdo_datum),
    veg_datum: new Date(dto.veg_datum),
  };
};

export const mapUpdateDtoToData = (
  existing: FoglalasRecord,
  dto: UpdateFoglalasDto,
): Partial<{
  foglalas_tipus: string;
  indulasi_hely: string;
  erkezesi_hely: string;
  indulasi_ido: Date;
  erkezesi_ido: Date;
  jaratszam: string | null;
  hely: string | null;
  cim: string | null;
  kezdo_datum: Date | null;
  veg_datum: Date | null;
}> => {
  const updated: Partial<{
    foglalas_tipus: string;
    indulasi_hely: string;
    erkezesi_hely: string;
    indulasi_ido: Date;
    erkezesi_ido: Date;
    jaratszam: string | null;
    hely: string | null;
    cim: string | null;
    kezdo_datum: Date | null;
    veg_datum: Date | null;
  }> = {};

  const nextType = dto.tipus ?? existing.foglalas_tipus;
  const typeChanged =
    dto.tipus !== undefined && dto.tipus !== existing.foglalas_tipus;

  if (typeChanged) {
    updated.foglalas_tipus = nextType;
    if (isTravelType(nextType)) {
      if (
        !dto.indulasi_hely ||
        !dto.erkezesi_hely ||
        !dto.indulasi_ido ||
        !dto.erkezesi_ido
      ) {
        throw new BadRequestException('Hianyzo utazasi adatok.');
      }
      updated.hely = null;
      updated.cim = null;
      updated.kezdo_datum = null;
      updated.veg_datum = null;
    } else if (!dto.hely || !dto.cim || !dto.kezdo_datum || !dto.veg_datum) {
      throw new BadRequestException('Hianyzo szallas adatok.');
    }
  }

  if (isTravelType(nextType)) {
    if (dto.indulasi_hely) updated.indulasi_hely = dto.indulasi_hely;
    if (dto.erkezesi_hely) updated.erkezesi_hely = dto.erkezesi_hely;
    if (dto.indulasi_ido) updated.indulasi_ido = new Date(dto.indulasi_ido);
    if (dto.erkezesi_ido) updated.erkezesi_ido = new Date(dto.erkezesi_ido);
    if (dto.jaratszam !== undefined) {
      updated.jaratszam = dto.jaratszam;
    } else if (typeChanged) {
      updated.jaratszam = null;
    }
  } else {
    if (dto.hely) {
      updated.hely = dto.hely;
      updated.indulasi_hely = dto.hely;
    }
    if (dto.cim) {
      updated.cim = dto.cim;
      updated.erkezesi_hely = dto.cim;
    }
    if (dto.kezdo_datum) {
      const kezdo = new Date(dto.kezdo_datum);
      updated.kezdo_datum = kezdo;
      updated.indulasi_ido = kezdo;
    }
    if (dto.veg_datum) {
      const veg = new Date(dto.veg_datum);
      updated.veg_datum = veg;
      updated.erkezesi_ido = veg;
    }
    if (typeChanged) {
      updated.jaratszam = null;
    }
  }

  return updated;
};

export const mapToListItem = (foglalas: FoglalasRecord): FoglalasListItem => {
  if (foglalas.foglalas_tipus === 'szallas') {
    return {
      azonosito: foglalas.foglalas_id,
      tipus: 'szallas',
      hely: foglalas.hely ?? foglalas.indulasi_hely,
      cim: foglalas.cim ?? foglalas.erkezesi_hely,
      kezdo_datum: formatDate(foglalas.kezdo_datum ?? foglalas.indulasi_ido),
      veg_datum: formatDate(foglalas.veg_datum ?? foglalas.erkezesi_ido),
    };
  }

  if (isTravelType(foglalas.foglalas_tipus)) {
    return {
      azonosito: foglalas.foglalas_id,
      tipus: foglalas.foglalas_tipus,
      indulasi_hely: foglalas.indulasi_hely,
      erkezesi_hely: foglalas.erkezesi_hely,
      indulasi_ido: foglalas.indulasi_ido.toISOString(),
      erkezesi_ido: foglalas.erkezesi_ido.toISOString(),
      jaratszam: foglalas.jaratszam,
    };
  }

  // Fallback for unknown types
  return {
    azonosito: foglalas.foglalas_id,
    tipus: 'repulo',
    indulasi_hely: foglalas.indulasi_hely,
    erkezesi_hely: foglalas.erkezesi_hely,
    indulasi_ido: foglalas.indulasi_ido.toISOString(),
    erkezesi_ido: foglalas.erkezesi_ido.toISOString(),
    jaratszam: foglalas.jaratszam,
  };
};
