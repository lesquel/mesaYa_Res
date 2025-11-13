#!/bin/bash
set -euo pipefail

BOOTSTRAP_SERVER="${KAFKA_BOOTSTRAP_SERVERS:-kafka:9092}"

TOPICS=(
  "mesa-ya.reviews.created"
  "mesa-ya.reviews.updated"
  "mesa-ya.reviews.deleted"
  "mesa-ya.restaurants.created"
  "mesa-ya.restaurants.updated"
  "mesa-ya.restaurants.deleted"
  "mesa-ya.sections.created"
  "mesa-ya.sections.updated"
  "mesa-ya.sections.deleted"
  "mesa-ya.tables.created"
  "mesa-ya.tables.updated"
  "mesa-ya.tables.deleted"
  "mesa-ya.objects.created"
  "mesa-ya.objects.updated"
  "mesa-ya.objects.deleted"
  "mesa-ya.menus.created"
  "mesa-ya.menus.updated"
  "mesa-ya.menus.deleted"
  "mesa-ya.dishes.created"
  "mesa-ya.dishes.updated"
  "mesa-ya.dishes.deleted"
  "mesa-ya.images.created"
  "mesa-ya.images.updated"
  "mesa-ya.images.deleted"
  "mesa-ya.section-objects.created"
  "mesa-ya.section-objects.updated"
  "mesa-ya.section-objects.deleted"
  "mesa-ya.reservations.created"
  "mesa-ya.reservations.updated"
  "mesa-ya.reservations.deleted"
  "mesa-ya.payments.created"
  "mesa-ya.payments.updated"
  "mesa-ya.payments.deleted"
  "mesa-ya.subscriptions.created"
  "mesa-ya.subscriptions.updated"
  "mesa-ya.subscriptions.deleted"
  "mesa-ya.subscription-plans.created"
  "mesa-ya.subscription-plans.updated"
  "mesa-ya.subscription-plans.deleted"
  "mesa-ya.auth.user-signed-up"
  "mesa-ya.auth.user-logged-in"
  "mesa-ya.auth.user-roles-updated"
  "mesa-ya.auth.role-permissions-updated"
)

for topic in "${TOPICS[@]}"; do
  echo "Ensuring topic: ${topic}"
  kafka-topics \
    --bootstrap-server "${BOOTSTRAP_SERVER}" \
    --create \
    --if-not-exists \
    --topic "${topic}" \
    --partitions 1 \
    --replication-factor 1

done

echo "Kafka topics ensured"
