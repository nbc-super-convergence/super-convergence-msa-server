# Base image for Filebeat
FROM elastic/filebeat:7.17.16

# Copy the Filebeat configuration file into the image
COPY apps/filebeat/filebeat.yml /usr/share/filebeat/filebeat.yml

# Set environment variable for the Elasticsearch host
ENV ELASTICSEARCH_HOST=ELK_SERVER

# Run Filebeat
ENTRYPOINT ["/usr/share/filebeat/filebeat"]