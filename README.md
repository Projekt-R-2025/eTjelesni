# eTjelesni

eTjelesni je web aplikacija koja se sastoji od odvojenog frontend i backend dijela, s komunikacijom temeljenom na REST standardu.

## Tehnologije

- Frontend: React 19.1.1 (JavaScript)
- Backend: Spring Boot 3.4.1 (Java 21)
- Baza podataka: PostgreSQL
- Build/Dependency: Maven, npm

## Autentifikacija i autorizacija

Autentifikacija korisnika provodi se putem **Microsoft FER računa**, koji predstavlja jedini dopušteni način prijave u aplikaciju. Pristup aplikaciji omogućen je isključivo korisnicima s važećim FER Microsoft identitetom, čime se osigurava kontroliran i ograničen pristup sustavu.

Nakon uspješne autentifikacije, aplikacija koristi **JWT (JSON Web Token)** za autorizaciju korisničkih zahtjeva. JWT se pohranjuje u **HTTP cookie**, koji se automatski šalje pri svakom zahtjevu prema API-ju, čime se omogućuje sigurna i stateless autorizacija.

Aplikacija podržava **višestruke istovremene sesije po korisniku (Multi-Device Sessions)**. Korisnik može biti prijavljen na više uređaja paralelno, a odjava na jednom uređaju neće automatski prekinuti aktivne sesije na ostalim uređajima.


## API

### Dokumentacija

API dokumentacija dostupna je putem **Swagger UI-ja** (springdoc-openapi).

Tijekom lokalnog razvoja dokumentacija je dostupna na:
- `http://localhost:8080/swagger-ui/index.html`  

Swagger prikazuje sve dostupne endpointe, potrebne parametre, sheme zahtjeva i odgovora te omogućuje slanje testnih poziva izravno iz preglednika.


## Frontend

Generalne informacije ...


## Lokalno pokretanje

### Preuzimanje projekta

Projekt se može preuzeti kloniranjem Git repozitorija:

```bash
git clone https://github.com/Projekt-R-2025/eTjelesni.git
cd eTjelesni
```

Prije pokretanja aplikacije potrebno je postaviti frontend i backend environment varijable. Za vrijednosti ovih varijabli i upute o njihovom postavljanju potrebno je kontaktirati developere aplikacije.

### Frontend

Koraci za pokretanje:
1. `cd frontend`
2. `npm install`
3. `npm run dev`

Nakon pokretanja, frontend aplikacija bit će dostupna na: `http://localhost:5173`

### Backend (API)

Koraci za pokretanje:
1. `cd backend`
2. `./mvnw spring-boot:run`

Nakon pokretanja, backend aplikacija bit će dostupna na: `http://localhost:8080`.