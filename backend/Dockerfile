FROM eclipse-temurin:21

WORKDIR /app

COPY mvnw pom.xml ./
COPY .mvn .mvn
COPY src src

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests
RUN mv target/*.jar target/app.jar

EXPOSE 8080

CMD ["java", "-jar", "target/app.jar"]
