import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { getCorsHeaders, handleCors } from '../_shared/cors.ts';

// Agora RTC Token Builder
class RtcTokenBuilder {
  static Role = {
    PUBLISHER: 1,
    SUBSCRIBER: 2,
  };

  static buildTokenWithUid(
    appId: string,
    appCertificate: string,
    channelName: string,
    uid: number,
    role: number,
    privilegeExpiredTs: number
  ): string {
    return this.buildTokenWithAccount(appId, appCertificate, channelName, uid.toString(), role, privilegeExpiredTs);
  }

  static buildTokenWithAccount(
    appId: string,
    appCertificate: string,
    channelName: string,
    account: string,
    role: number,
    privilegeExpiredTs: number
  ): string {
    const version = '007';
    const randomInt = Math.floor(Math.random() * 0xFFFFFFFF);
    const timestamp = Math.floor(Date.now() / 1000);
    const salt = randomInt;
    
    const message = this.packMessage(appId, timestamp, salt, channelName, account, role, privilegeExpiredTs);
    const signature = this.generateSignature(appCertificate, message);
    
    return `${version}${appId}${this.uint32ToHex(timestamp)}${this.uint32ToHex(salt)}${signature}${this.base64Encode(message)}`;
  }

  private static packMessage(
    appId: string,
    timestamp: number,
    salt: number,
    channelName: string,
    account: string,
    role: number,
    privilegeExpiredTs: number
  ): Uint8Array {
    const msg = new TextEncoder().encode(
      `${appId}${timestamp}${salt}${channelName}${account}${role}${privilegeExpiredTs}`
    );
    return msg;
  }

  private static generateSignature(appCertificate: string, message: Uint8Array): string {
    const key = new TextEncoder().encode(appCertificate);
    return this.hmacSha256(key, message);
  }

  private static async hmacSha256(key: Uint8Array, data: Uint8Array): Promise<string> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    return this.arrayBufferToHex(signature);
  }

  private static arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private static uint32ToHex(num: number): string {
    return num.toString(16).padStart(8, '0');
  }

  private static base64Encode(data: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    return btoa(binary);
  }
}

serve(async (req) => {
  // Handle CORS
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const { headers } = corsResult;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Проверяем авторизацию
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Не авторизован');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Не авторизован');
    }

    const { channelName, role = 'publisher' } = await req.json();

    if (!channelName) {
      throw new Error('Не указан канал');
    }

    const APP_ID = Deno.env.get('AGORA_APP_ID');
    const APP_CERTIFICATE = Deno.env.get('AGORA_APP_CERTIFICATE');

    if (!APP_ID || !APP_CERTIFICATE) {
      throw new Error('Agora credentials не настроены');
    }

    // Генерируем токен на 24 часа
    const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + (24 * 3600);
    const uid = 0; // 0 означает что Agora сам назначит uid
    const userRole = role === 'subscriber' ? RtcTokenBuilder.Role.SUBSCRIBER : RtcTokenBuilder.Role.PUBLISHER;

    const token = await RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      userRole,
      expirationTimeInSeconds
    );

    console.log('✅ Agora токен сгенерирован для пользователя:', user.id, 'канал:', channelName);

    return new Response(
      JSON.stringify({
        token,
        appId: APP_ID,
        channelName,
        uid,
        expiresAt: expirationTimeInSeconds,
      }),
      {
        headers: { ...headers, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Ошибка генерации Agora токена:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Не удалось сгенерировать токен',
      }),
      {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      }
    );
  }
});