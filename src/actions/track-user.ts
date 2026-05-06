"use server"

// Kafka analytics is disabled in standalone mode (no monorepo kafka package)
export async function sendKafkaEvent(eventData: {
  userId?: string
  productId?: string
  shopId?: string
  action: string
  device?: string
  country?: string
  city?: string
}) {
  // No-op: Kafka is not available in standalone mode
  // Events are silently dropped — this is intentional
}
