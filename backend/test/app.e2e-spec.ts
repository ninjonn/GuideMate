import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Users (e2e)', () => {
  // Teljes auth + profil + jelszo flow egyben, valos DB-vel.
  let app: INestApplication;
  let token: string;

  // Egyedi teszt adatok, hogy ne utkozzunk mas futasokkal.
  const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  const initialEmail = `e2e.user.${uniqueSuffix}@example.com`;
  const updatedEmail = `e2e.user.updated.${uniqueSuffix}@example.com`;
  const initialPassword = 'secret123';
  const newPassword = 'newSecret456';
  const firstName = 'Test';
  const lastName = 'User';
  const updatedFirstName = 'Updated';
  const updatedLastName = 'Name';

  beforeAll(async () => {
    // Teszt app felhuzasa a teljes AppModule-lal.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Ugyanaz a validacios pipe, mint a valos alkalmazasban.
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    // App leallitasa a tesztek utan.
    await app.close();
  });

  it('registers a new user', async () => {
    // Regisztracio uj userrel.
    const res = await request(app.getHttpServer())
      .post('/api/auth/regisztracio')
      .send({
        vezeteknev: firstName,
        keresztnev: lastName,
        email: initialEmail,
        jelszo: initialPassword,
      })
      .expect(201);

    // Ellenorizzuk az alap valasz mezoket.
    expect(res.body).toMatchObject({
      azonosito: expect.any(Number),
      nev: `${firstName} ${lastName}`,
      email: initialEmail,
      szerepkor: 'felhasznalo',
    });
  });

  it('logs in and returns a token', async () => {
    // Bejelentkezes a frissen regisztralt userrel.
    const res = await request(app.getHttpServer())
      .post('/api/auth/bejelentkezes')
      .send({
        email: initialEmail,
        jelszo: initialPassword,
      })
      .expect(200);

    // A token kell a kovetkezo, vedett hivasokhoz.
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('updates the profile', async () => {
    // Profil modositas tokennel.
    const res = await request(app.getHttpServer())
      .put('/api/felhasznalok/profil')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vezeteknev: updatedFirstName,
        keresztnev: updatedLastName,
        email: updatedEmail,
      })
      .expect(200);

    // A valaszban az uj adatoknak kell megjelenniuk.
    expect(res.body).toMatchObject({
      azonosito: expect.any(Number),
      nev: `${updatedFirstName} ${updatedLastName}`,
      email: updatedEmail,
      sikeres: true,
    });
  });

  it('changes the password', async () => {
    // Jelszocsere a regi jelszo ellenorzesevel.
    const res = await request(app.getHttpServer())
      .put('/api/felhasznalok/jelszo')
      .set('Authorization', `Bearer ${token}`)
      .send({
        regi_jelszo: initialPassword,
        uj_jelszo: newPassword,
      })
      .expect(200);

    // A sikeres valasz eleg az ellenorzeshez.
    expect(res.body).toMatchObject({
      sikeres: true,
    });
  });

  it('rejects login with the old password', async () => {
    // A regi jelszo mar nem lehet ervenyes.
    await request(app.getHttpServer())
      .post('/api/auth/bejelentkezes')
      .send({
        email: updatedEmail,
        jelszo: initialPassword,
      })
      .expect(401);
  });

  it('logs in with the new password', async () => {
    // Az uj jelszo mar mukodni fog.
    const res = await request(app.getHttpServer())
      .post('/api/auth/bejelentkezes')
      .send({
        email: updatedEmail,
        jelszo: newPassword,
      })
      .expect(200);

    // Token erkezik, ami jelzi a sikeres login-t.
    expect(res.body.token).toBeDefined();
  });
});
