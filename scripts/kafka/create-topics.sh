#!/bin/bash
# =============================================================================
# MesaYA - Script de inicialización de topics de Kafka
# =============================================================================
# NOTA: Este script está DEPRECADO. Usar el script centralizado en:
#       /infrastructure/kafka/create-topics.sh
#
# DISEÑO: Un topic por dominio/agregado (Event-Driven Architecture)
# El tipo de evento se especifica en el payload con `event_type`
# =============================================================================

set -euo pipefail

BOOTSTRAP_SERVER="${KAFKA_BOOTSTRAP_SERVERS:-kafka:9092}"

echo "=============================================="
echo "  MesaYA - Inicializando Topics de Kafka"
echo "=============================================="
echo "Bootstrap Server: ${BOOTSTRAP_SERVER}"
echo ""
echo "NOTA: Considera usar el script centralizado en /infrastructure/kafka/"
echo ""

# Lista de topics - UN TOPIC POR ENTIDAD/DOMINIO
TOPICS=(
  "mesa-ya.restaurants.events"
  "mesa-ya.sections.events"
  "mesa-ya.tables.events"
  "mesa-ya.objects.events"
  "mesa-ya.section-objects.events"
  "mesa-ya.menus.events"
  "mesa-ya.reviews.events"
  "mesa-ya.images.events"
  "mesa-ya.reservations.events"
  "mesa-ya.payments.events"
  "mesa-ya.subscriptions.events"
  "mesa-ya.auth.events"
  "mesa-ya.owner-upgrade.events"
)

for topic in "${TOPICS[@]}"; do
  echo "Ensuring topic: ${topic}"
  /opt/kafka/bin/kafka-topics.sh \
    --bootstrap-server "${BOOTSTRAP_SERVER}" \
    --create \
    --if-not-exists \
    --topic "${topic}" \
    --partitions 3 \
    --replication-factor 1

done

echo "Kafka topics ensured"
