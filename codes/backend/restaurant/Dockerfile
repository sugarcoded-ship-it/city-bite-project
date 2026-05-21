FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copy wrapper and configuration files
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Make gradlew executable
RUN chmod +x gradlew

# Pre-cache dependencies
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

EXPOSE 8080

# Run Spring Boot in development mode
CMD ["./gradlew", "bootRun", "--no-daemon"]
