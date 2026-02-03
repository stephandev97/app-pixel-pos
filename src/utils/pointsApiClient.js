// Cliente para conectar al PB de la app de puntos desde el POS
import PocketBase from 'pocketbase';

// URL de la app de puntos
const POINTS_PB_URL =
  import.meta.env.VITE_POINTS_PB_URL || 'https://pixel-pwa-backend-production.up.railway.app';

// Credenciales del usuario POS
const POS_CREDENTIALS = {
  email: import.meta.env.VITE_POS_EMAIL || 'pos@pixelhelados.com',
  password: import.meta.env.VITE_POS_PASSWORD || '12345678',
};

// Factor de puntos configurable (ARS por punto)
export const POINTS_RATE = Number(import.meta.env.VITE_POINTS_RATE || 1100) || 1100;

export class PointsApiClient {
  constructor() {
    this.pb = new PocketBase(POINTS_PB_URL);
    this.pb.autoCancellation(false);
    this.isAuthenticated = false;
  }

  // Autenticar como usuario POS
  async authenticate() {
    try {
      console.log('🔐 Autenticando usuario POS en app de puntos...');
      await this.pb
        .collection('users')
        .authWithPassword(POS_CREDENTIALS.email, POS_CREDENTIALS.password);
      this.isAuthenticated = true;
      console.log('✅ Usuario POS autenticado exitosamente');
      return { success: true, message: 'Usuario POS autenticado' };
    } catch (error) {
      console.error('❌ Error autenticando usuario POS:', error);
      this.isAuthenticated = false;
      return {
        success: false,
        message: `Error de autenticación: ${error.message}`,
        error: error.message,
      };
    }
  }

  // Asegurar autenticación antes de cualquier operación
  async ensureAuthenticated() {
    if (!this.isAuthenticated || !this.pb.authStore.isValid) {
      return await this.authenticate();
    }
    return { success: true, message: 'Ya autenticado' };
  }

  // Buscar QR en la app de puntos
  async findQRCode(qrData) {
    try {
      console.log('🔍 POS: Buscando QR en app de puntos:', qrData);

      // Asegurar autenticación
      const authResult = await this.ensureAuthenticated();
      if (!authResult.success) {
        return {
          found: false,
          type: 'auth_error',
          data: null,
          message: `❌ Error de autenticación: ${authResult.message}`,
        };
      }

      console.log('🔐 Usuario autenticado, buscando en colecciones...');

      // Verificar qué colecciones están disponibles
      try {
        const collections = await this.pb.collections.get();
        console.log(
          '📋 Colecciones disponibles:',
          collections.map((c) => c.name)
        );
      } catch (e) {
        console.log('⚠️ No se pueden listar colecciones:', e.message);
      }

      // Buscar en reward_claims (cupones/claims) - esto es lo más común para POS
      console.log('🎫 Buscando en reward_claims (cupones)...');
      let claim = null;
      try {
        // Buscamos principalmente por 'code' (código de cupón) o por 'id'
        claim = await this.pb
          .collection('reward_claims')
          .getFirstListItem(`code = "${qrData}" || id = "${qrData}"`, {
            expand: 'reward,client',
          })
          .catch((err) => {
            // Si no se encuentra (404) o hay error de campo (400), retornamos null
            // para que siga buscando en otras colecciones
            if (err.status !== 404) {
              console.log('⚠️ Error en búsqueda de reward_claims:', err.message);
            }
            return null;
          });
      } catch (err) {
        console.log('❌ Error crítico en reward_claims:', err.message);
      }

      if (claim) {
        console.log('✅ Cupón encontrado:', claim);

        // Construir nombre del cliente de forma robusta
        let clientName = 'Cliente';
        let clientDni = '';

        if (claim.expand?.client) {
          const c = claim.expand.client;
          clientName = `${c.name || ''} ${c.surname || ''}`.trim() || c.email || 'Cliente';
          // Intentamos obtener el DNI de varios campos posibles por seguridad
          clientDni = c.dni || c.document || c.cedula || '';
        }

        return {
          found: true,
          type: 'claim',
          data: claim,
          message: '🎫 Cupón encontrado en sistema de puntos',
          rewardTitle: claim.expand?.reward?.title || 'Premio',
          clientName: clientName,
          clientDni: clientDni, // Nuevo campo DNI
          pointsCost: claim.pointsCost || 0,
          claimId: claim.id,
          status: claim.status,
        };
      }

      // Buscar en rewards (premios directos) - si el QR es de un premio directamente
      console.log('🎁 Buscando en rewards (premios directos)...');
      let reward = null;
      try {
        reward = await this.pb
          .collection('rewards')
          .getFirstListItem(`qr_code = "${qrData}" || short_code = "${qrData}"`)
          .catch((err) => {
            console.log('⚠️ Error en búsqueda de rewards:', err.message);
            return null;
          });
      } catch (err) {
        console.log('❌ Error crítico en rewards:', err.message);
      }

      if (reward) {
        console.log('✅ Premio directo encontrado:', reward);
        return {
          found: true,
          type: 'reward',
          data: reward,
          message: '🎁 Premio directo encontrado en sistema de puntos',
          pointsCost: reward.pointsCost,
          title: reward.title,
          rewardId: reward.id,
        };
      }

      // Buscar en clientes (si el QR es de un cliente)
      console.log('👤 Buscando en clients...');
      let client = null;

      // Estrategia secuencial para evitar error 400 si un campo no existe

      // 1. Intentar búsqueda directa por ID (siempre seguro)
      try {
        client = await this.pb.collection('clients').getOne(qrData);
      } catch (e) {
        // Ignorar error si no es un ID válido o no se encuentra
      }

      // 2. Si no es ID, intentar buscar por otros campos comunes
      if (!client) {
        // Lista de campos posibles donde podría estar el código
        // 'qrCodeValue' es el campo específico de esta app, luego fallbacks comunes
        const fieldsToTry = ['qrCodeValue', 'code', 'qr_code', 'dni'];

        for (const field of fieldsToTry) {
          try {
            client = await this.pb.collection('clients').getFirstListItem(`${field} = "${qrData}"`);

            if (client) {
              console.log(`✅ Cliente encontrado por campo: ${field}`);
              break; // Éxito
            }
          } catch (err) {
            // Si el error es 400, significa que el campo probablemente no existe en la colección.
            // Si es 404, es que no encontró coincidencia.
            // En ambos casos, continuamos al siguiente campo.
            if (err.status !== 404 && err.status !== 400) {
              console.log(`⚠️ Error buscando en campo ${field}:`, err.message);
            }
          }
        }
      }

      if (client) {
        console.log('✅ Cliente encontrado:', client);
        return {
          found: true,
          type: 'client',
          data: client,
          message: '👤 Cliente encontrado en sistema de puntos',
          pointsBalance: client.pointsBalance || 0,
          name: client.name || client.email,
          level: client.level || 'basic',
          clientId: client.id,
        };
      }

      console.log('❌ QR no encontrado en ninguna colección');
      return {
        found: false,
        type: 'not_found',
        data: null,
        message: '❌ QR no encontrado en sistema de puntos',
        searchedCode: qrData,
      };
    } catch (error) {
      console.error('❌ Error general buscando QR en app de puntos:', error);
      return {
        found: false,
        type: 'error',
        data: null,
        message: `❌ Error de conexión: ${error.message}`,
        error: error.message,
      };
    }
  }

  // Obtener info detallada del cliente desde app de puntos
  async getClientInfo(clientId) {
    try {
      await this.ensureAuthenticated();
      const client = await this.pb.collection('clients').getOne(clientId);

      // Obtener transacciones recientes
      const transactions = await this.pb.collection('points_transactions').getList(1, 10, {
        filter: `client = "${clientId}"`,
        sort: '-created',
      });

      // Obtener premios canjeados
      const claims = await this.pb.collection('reward_claims').getList(1, 10, {
        filter: `client = "${clientId}"`,
        expand: 'reward',
        sort: '-created',
      });

      return {
        success: true,
        client: {
          ...client,
          recentTransactions: transactions.items,
          recentClaims: claims.items,
        },
      };
    } catch (error) {
      console.error('Error obteniendo info del cliente:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Canjear cupón desde POS
  async redeemRewardFromPos(claimId, posOperator) {
    try {
      await this.ensureAuthenticated();

      // Validar que claimId sea válido
      if (!claimId) {
        return {
          success: false,
          message: '❌ ID de cupón inválido',
        };
      }

      // Obtener el claim original
      const claim = await this.pb.collection('reward_claims').getOne(claimId);

      if (claim.status !== 'pending') {
        return {
          success: false,
          message: `❌ Cupón no está pendiente. Estado actual: ${claim.status}`,
        };
      }

      let clientPoints = null;
      let rewardTitle = null;

      // Si hay un reward asociado, descontar puntos del cliente
      if (claim.reward && claim.client) {
        console.log('💰 Procesando transacción de puntos para cliente:', claim.client);

        try {
          const client = await this.pb.collection('clients').getOne(claim.client);
          const reward = await this.pb.collection('rewards').getOne(claim.reward);

          if (client.pointsBalance < reward.pointsCost) {
            return {
              success: false,
              message: `⚠️ Puntos insuficientes. Tiene ${client.pointsBalance}, necesita ${reward.pointsCost}`,
            };
          }

          // 1. Crear registro en points_transactions (Historial)
          try {
            await this.pb.collection('points_transactions').create({
              client: claim.client,
              points: -reward.pointsCost, // Negativo para indicar gasto
              type: 'redeem', // Valor exacto según esquema
              related_claim: claim.id,
              description: claim.expand?.reward?.title || 'Premio',
            });
          } catch (txError) {
            console.error('❌ Error detallado creando transacción:', txError.data);
            throw new Error(`Error registrando transacción: ${JSON.stringify(txError.data)}`);
          }

          // 2. Actualizar saldo del cliente (Lógica de descuento)
          await this.pb.collection('clients').update(claim.client, {
            pointsBalance: client.pointsBalance - reward.pointsCost,
            last_reward_claimed: claim.reward,
            last_claim_date: new Date().toISOString(),
          });

          clientPoints = client.pointsBalance - reward.pointsCost;
          rewardTitle = claim.expand?.reward?.title || 'Premio';
        } catch (clientError) {
          console.log('❌ Error obteniendo cliente o reward:', clientError.message);
          return {
            success: false,
            message: `❌ Error obteniendo datos del cliente: ${clientError.message}`,
          };
        }
      }

      // Actualizar el claim a 'redeemed'
      const updatedClaim = await this.pb.collection('reward_claims').update(claimId, {
        status: 'redeemed',
        claimed_from: 'pos',
        pos_operator: posOperator,
        claimed_at: new Date().toISOString(),
        pos_location: 'main',
      });

      const finalResult = {
        success: true,
        claim: updatedClaim,
        message: rewardTitle
          ? `✅ Cupón "${rewardTitle}" canjeado exitosamente`
          : `✅ Cupón canjeado exitosamente (sin descuento de puntos)`,
        newBalance: clientPoints,
        rewardTitle: rewardTitle,
      };

      return finalResult;
    } catch (error) {
      console.error('Error canjeando cupón desde POS:', error);
      return {
        success: false,
        message: `❌ Error al canjear: ${error.message}`,
      };
    }
  }

  // Agregar puntos desde POS
  async addPointsFromPos(clientId, pointsToAdd, reason, _posOperator) {
    try {
      await this.ensureAuthenticated();
      const client = await this.pb.collection('clients').getOne(clientId);

      // Crear transacción de puntos
      // Schema: client (relation), points (number), type (earn, redeem), related_claim (relation), description (text)
      const transaction = await this.pb.collection('points_transactions').create({
        client: clientId,
        points: pointsToAdd,
        type: 'earn',
        description: reason || 'Compra en POS',
      });

      // Actualizar balance del cliente
      const updatedClient = await this.pb.collection('clients').update(clientId, {
        pointsBalance: client.pointsBalance + pointsToAdd,
      });

      return {
        success: true,
        transaction: transaction,
        updatedClient: updatedClient,
        message: `✅ ${pointsToAdd} puntos agregados exitosamente`,
        newBalance: updatedClient.pointsBalance,
      };
    } catch (error) {
      console.error('Error agregando puntos desde POS:', error);
      return {
        success: false,
        message: `❌ Error al agregar puntos: ${error.message}`,
      };
    }
  }

  // Verificar conexión con la app de puntos
  async testConnection() {
    try {
      // Primero intentar autenticar
      const authResult = await this.authenticate();
      if (!authResult.success) {
        return {
          success: false,
          message: authResult.message,
          url: POINTS_PB_URL,
          error: authResult.error,
        };
      }

      // Intentar obtener algo simple para probar conexión
      await this.pb.collection('rewards').getList(1, 1);
      return {
        success: true,
        message: '✅ Conectado y autenticado en app de puntos',
        url: POINTS_PB_URL,
      };
    } catch (error) {
      console.log('❌ Error de conexión con app de puntos:', error);
      return {
        success: false,
        message: `❌ Error de conexión con app de puntos: ${error.message}`,
        url: POINTS_PB_URL,
        error: error.message,
      };
    }
  }
}

// Instancia global para usar en el POS
export const pointsApiClient = new PointsApiClient();
