# Build stage
FROM maven:3.8.4-openjdk-17 AS build

WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
COPY .mvn/ .mvn
COPY mvnw .
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src/ src/

# Build the application with production profile
RUN ./mvnw clean package -DskipTests -Pprod -Dspring-boot.repackage.skip=false

# Runtime stage
FROM eclipse-temurin:17-jre

WORKDIR /app

# Set JVM options for production (adjusted for Cloud Run)
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Copy the JAR file from the build stage
COPY --from=build /app/target/Backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8080

# Use JSON array format for ENTRYPOINT (fixes the warning and improves signal handling)
ENTRYPOINT ["sh", "-c", "echo 'Starting application with PORT=${PORT:-8080}' && \
  java $JAVA_OPTS -Dserver.port=${PORT:-8080} -Dspring.profiles.active=prod -Dspring.config.location=classpath:/application.properties,classpath:/application-${SPRING_PROFILES_ACTIVE:-prod}.properties -jar app.jar"]