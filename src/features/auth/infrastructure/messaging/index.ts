/**
 * Public exports de messaging.
 *
 * KafkaAuthProvider es interno - se inyecta vía AUTH_PROVIDER token.
 * AUTH_KAFKA_CLIENT solo para uso interno del módulo.
 */
export { AUTH_KAFKA_CLIENT, KafkaAuthProvider } from './kafka-auth.provider';

/**
 * @deprecated Use KafkaAuthProvider + AUTH_PROVIDER token instead.
 * Se mantiene temporalmente para compatibilidad.
 */
export * from './auth-proxy.service';
