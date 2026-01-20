/**
 * Tipos internos de Kafka (no públicos).
 * Contrato entre Gateway y Auth MS.
 */

export interface KafkaAuthProxyResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface KafkaSignUpPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface KafkaLoginPayload {
  email: string;
  password: string;
}

export interface KafkaRefreshTokenPayload {
  refreshToken: string;
}

export interface KafkaLogoutPayload {
  userId: string;
  revokeAll?: boolean;
}

export interface KafkaTokenData {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
  accessToken: string;
  refreshToken: string;
}

export interface KafkaUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}
