FROM eclipse-temurin:21-jre-noble@sha256:96975602e131485862eb8cd32927face8a06d7591a5e865944b634a701d9df72

COPY deploy/backend-healthcheck.sh /usr/local/bin/backend-healthcheck

RUN chmod 0555 /usr/local/bin/backend-healthcheck \
    && groupadd --system app \
    && useradd --system --gid app --home-dir /app app
WORKDIR /app

COPY --chown=app:app build/libs/app.jar /app/app.jar

USER app
EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
