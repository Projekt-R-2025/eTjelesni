# eTjelesni

eTjelesni je web aplikacija koja se sastoji od odvojenog frontend i backend dijela, s komunikacijom temeljenom na REST standardu.

## Tehnologije

- Frontend: React 19.1.1 (JavaScript)
- Backend: Spring Boot 3.4.1 (Java 21)
- Baza podataka: PostgreSQL
- Build/Dependency: Maven, npm


## Autentifikacija

Autentifikacija korisnika provodi se putem **Microsoft FER računa**, koji predstavlja jedini dopušteni način prijave u aplikaciju. Pristup aplikaciji omogućen je isključivo korisnicima s važećim FER Microsoft identitetom, čime se osigurava kontroliran i ograničen pristup sustavu.

## Deployment
Cijeli projekt hostan je na **[Renderu](https://etjelesni.onrender.com)**, a svaki push na `main` branch automatski pokreće deploy preko **GitHub Actions**.


## API Dokumentacija

[API dokumentacija](https://etjelesni-api.onrender.com/swagger-ui/index.html) generirana je pomoću **Swagger UI-ja** i omogućuje pregled svih endpointova, potrebnih parametara, shema zahtjeva i odgovora, te slanje testnih poziva izravno iz preglednika.


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

```bash
cd frontend
npm install
npm run dev
```

Nakon pokretanja, frontend aplikacija bit će dostupna na: `http://localhost:5173`

### Backend (API)

Koraci za pokretanje:

```bash
cd backend
./mvnw spring-boot:run
```

Nakon pokretanja, backend aplikacija bit će dostupna na: `http://localhost:8080`.
