FROM searxng/searxng:latest

COPY settings.example.yml /etc/searxng/settings.yml

ENTRYPOINT ["/bin/sh", "-c", "sed -i \"s|REPLACE_WITH_SECRET|${SEARXNG_SECRET}|g\" /etc/searxng/settings.yml && exec /usr/local/searxng/entrypoint.sh"]