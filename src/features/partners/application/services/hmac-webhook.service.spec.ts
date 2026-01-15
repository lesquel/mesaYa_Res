/**
 * HMAC Webhook Service Unit Tests
 */

import { HmacWebhookService } from './hmac-webhook.service';
import { createHmac } from 'crypto';

describe('HmacWebhookService', () => {
  let service: HmacWebhookService;
  const testSecret = 'whsec_test_secret_key_12345678901234567890';

  beforeEach(() => {
    service = new HmacWebhookService();
  });

  describe('generateSignature', () => {
    it('should generate a valid signature format', () => {
      const payload = JSON.stringify({ event: 'test', data: { id: 1 } });
      const result = service.generateSignature(payload, testSecret);

      expect(result.signature).toMatch(/^t=\d+,v1=[a-f0-9]{64}$/);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it('should include timestamp in signature', () => {
      const payload = '{"test": true}';
      const result = service.generateSignature(payload, testSecret);

      const parts = result.signature.split(',');
      const timestampPart = parts[0];
      expect(timestampPart.startsWith('t=')).toBe(true);

      const timestamp = parseInt(timestampPart.replace('t=', ''));
      expect(timestamp).toBe(result.timestamp);
    });

    it('should produce different signatures for different payloads', () => {
      const payload1 = '{"event": "reservation.created"}';
      const payload2 = '{"event": "reservation.cancelled"}';

      const sig1 = service.generateSignature(payload1, testSecret);
      const sig2 = service.generateSignature(payload2, testSecret);

      expect(sig1.signature).not.toBe(sig2.signature);
    });

    it('should produce different signatures for different secrets', () => {
      const payload = '{"event": "test"}';
      const secret1 = 'whsec_secret_one';
      const secret2 = 'whsec_secret_two';

      const sig1 = service.generateSignature(payload, secret1);
      const sig2 = service.generateSignature(payload, secret2);

      // Extract v1 part only (timestamp will differ)
      const v1Part1 = sig1.signature.split(',')[1];
      const v1Part2 = sig2.signature.split(',')[1];

      expect(v1Part1).not.toBe(v1Part2);
    });
  });

  describe('verifySignature', () => {
    it('should verify a valid signature', () => {
      const payload = JSON.stringify({ event: 'reservation.created' });
      const { signature } = service.generateSignature(payload, testSecret);

      const result = service.verifySignature(signature, payload, testSecret);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid signature format', () => {
      const result = service.verifySignature(
        'invalid-signature',
        '{}',
        testSecret,
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature format');
    });

    it('should reject signature without timestamp', () => {
      const result = service.verifySignature('v1=abc123', '{}', testSecret);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature format');
    });

    it('should reject expired signatures (> 5 minutes old)', () => {
      const payload = '{"event": "test"}';
      const oldTimestamp = Math.floor(Date.now() / 1000) - 400; // 6+ minutes ago

      // Manually create an old signature
      const signedPayload = `${oldTimestamp}.${payload}`;
      const expectedSignature = createHmac('sha256', testSecret)
        .update(signedPayload)
        .digest('hex');

      const signature = `t=${oldTimestamp},v1=${expectedSignature}`;

      const result = service.verifySignature(signature, payload, testSecret);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Signature timestamp expired');
    });

    it('should reject tampered payload', () => {
      const originalPayload = '{"event": "reservation.created"}';
      const { signature } = service.generateSignature(
        originalPayload,
        testSecret,
      );

      const tamperedPayload = '{"event": "reservation.cancelled"}';
      const result = service.verifySignature(
        signature,
        tamperedPayload,
        testSecret,
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Signature mismatch');
    });

    it('should reject wrong secret', () => {
      const payload = '{"event": "test"}';
      const { signature } = service.generateSignature(payload, testSecret);

      const result = service.verifySignature(
        signature,
        payload,
        'whsec_wrong_secret',
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Signature mismatch');
    });
  });

  describe('buildWebhookHeaders', () => {
    it('should build correct headers', () => {
      const signature = 't=1234567890,v1=abcdef1234567890';
      const headers = service.buildWebhookHeaders(signature);

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-MesaYa-Signature']).toBe(signature);
      expect(headers['X-MesaYa-Webhook-Version']).toBe('v1');
    });

    it('should include custom source header', () => {
      const signature = 't=123,v1=abc';
      const headers = service.buildWebhookHeaders(signature);

      expect(headers['User-Agent']).toBe('MesaYa-Webhook/1.0');
    });
  });
});
