// Cliente para conectar al PB de la app de puntos desde el POS
import PocketBase from 'pocketbase';

// URL de la app de puntos (mismo PB que el POS)
const POINTS_PB_URL =
  import.meta.env.VITE_POINTS_PB_URL || 'https://railway-production-857d.up.railway.app';

// URL del PB de rewards (app de puntos)
const REWARDS_PB_URL =
  import.meta.env.VITE_REWARDS_PB_URL || 'https://pixel-pwa-backend-production.up.railway.app';

// URL del PB de clientes (pixel-pwa-backend - para buscar QR de clientes)
const CLIENTS_PB_URL =
  import.meta.env.VITE_CLIENTS_PB_URL || 'https://pixel-pwa-backend-production.up.railway.app';

// Credenciales del usuario POS (mismo que en pb-config.js)
const POS_CREDENTIALS = {
  email: import.meta.env.VITE_POS_EMAIL || 'pos@pixelhelados.com',
  password: import.meta.env.VITE_POS_PASSWORD || '12345678',
};

// Factor de puntos configurable (ARS por punto) - $100 = 1 punto
export const POINTS_RATE = Number(import.meta.env.VITE_POINTS_RATE || 100) || 100;

export class PointsApiClient {
  constructor() {
    this.pb = new PocketBase(POINTS_PB_URL);
    this.pbRewards = new PocketBase(REWARDS_PB_URL);
    this.pbClients = new PocketBase(CLIENTS_PB_URL);
    this.pb.autoCancellation(false);
    this.pbRewards.autoCancellation(false);
    this.pbClients.autoCancellation(false);
    this.isAuthenticated = false;
    this.isRewardsAuthenticated = false;
    this.isClientsAuthenticated = false;
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

  // Autenticar en el PB de rewards
  async authenticateRewards() {
    try {
      console.log('🔐 Autenticando usuario POS en app de rewards...');
      await this.pbRewards
        .collection('users')
        .authWithPassword(POS_CREDENTIALS.email, POS_CREDENTIALS.password);
      this.isRewardsAuthenticated = true;
      console.log('✅ Usuario POS autenticado en rewards');
      return { success: true, message: 'Usuario POS autenticado en rewards' };
    } catch (error) {
      console.error('❌ Error autenticando en rewards:', error);
      this.isRewardsAuthenticated = false;
      return {
        success: false,
        message: `Error de autenticación: ${error.message}`,
        error: error.message,
      };
    }
  }

  // Autenticar en PB de clientes (pixel-pwa-backend)
  async authenticateClients() {
    try {
      console.log('🔐 Autenticando usuario POS en PB de clientes...', CLIENTS_PB_URL);
      await this.pbClients
        .collection('users')
        .authWithPassword(POS_CREDENTIALS.email, POS_CREDENTIALS.password);
      this.isClientsAuthenticated = true;
      console.log('✅ Usuario POS autenticado en PB de clientes');
      return { success: true, message: 'Usuario POS autenticado en PB de clientes' };
    } catch (error) {
      console.error('❌ Error autenticando en PB de clientes:', error);
      this.isClientsAuthenticated = false;
      return { success: false, message: `Error: ${error.message}`, error: error.message };
    }
  }

  // Asegurar autenticación antes de cualquier operación
  async ensureAuthenticated() {
    if (!this.isAuthenticated || !this.pb.authStore.isValid) {
      return await this.authenticate();
    }
    return { success: true, message: 'Ya autenticado' };
  }

  // Asegurar autenticación en rewards
  async ensureRewardsAuthenticated() {
    if (!this.isRewardsAuthenticated || !this.pbRewards.authStore.isValid) {
      return await this.authenticateRewards();
    }
    return { success: true, message: 'Ya autenticado en rewards' };
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

      // Asegurar autenticación en rewards
      const authRewardsResult = await this.ensureRewardsAuthenticated();
      if (!authRewardsResult.success) {
        console.log('⚠️ No se pudo autenticar en rewards:', authRewardsResult.message);
      }

      // Buscar en reward_claims (cupones/claims) - esto es lo más común para POS
      console.log('🎫 Buscando en reward_claims (cupones)...');
      let claim = null;
      try {
        // Buscamos principalmente por 'code' (código de cupón) o por 'id'
        claim = await this.pbRewards
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
        reward = await this.pbRewards
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

      // Buscar en clientes (si el QR es de un cliente) - en PB de clientes (pixel-pwa-backend)
      console.log('👤 Buscando en clients (PB clientes)...', CLIENTS_PB_URL);
      
      // Autenticar primero para ver los clientes
      console.log('🔐 Autenticando en PB clientes...');
      await this.authenticateClients();
      
      // Ver qué clientes hay
      try {
        const clientsList = await this.pbClients.collection('clients').getList(1, 50);
        console.log('📋 Total clientes:', clientsList.totalItems);
        console.log('📋 Clientes:', clientsList.items?.map(c => ({ id: c.id, qrCodeValue: c.qrCodeValue, name: c.name })));
      } catch (e) {
        console.log('⚠️ Error obteniendo clientes:', e.status, e.message);
      }
      
      // Verificar que el cliente existe
      console.log('🔍 Buscando cliente con código:', qrData, '| trimmed:', qrData.trim());
      
      let client = null;

      // 1. Intentar búsqueda directa por ID (siempre seguro)
      const searchCode = qrData.trim();
      try {
        console.log('🔍 Intentando por ID:', searchCode);
        client = await this.pbClients.collection('clients').getOne(searchCode);
        console.log('✅ Cliente encontrado por ID:', client?.id, client?.name);
      } catch (e) {
        console.log('⚠️ No encontrado por ID:', e.status, e.message);
      }

      // 2. Si no es ID, intentar buscar por otros campos comunes
      if (!client) {
        const fieldsToTry = ['qrCodeValue', 'id'];

        for (const field of fieldsToTry) {
          try {
            console.log(`🔍 Intentando por campo ${field}:`, searchCode);
            client = await this.pbClients.collection('clients').getFirstListItem(`${field} = "${searchCode}"`);

            if (client) {
              console.log(`✅ Cliente encontrado por campo: ${field}`, client);
              break;
            }
          } catch (err) {
            console.log(`⚠️ Campo ${field} error:`, err.status, err.message);
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
      await this.ensureRewardsAuthenticated();
      await this.authenticateClients();
      
      const client = await this.pbClients.collection('clients').getOne(clientId);

      // Obtener transacciones recientes
      const transactions = await this.pbClients.collection('points_transactions').getList(1, 10, {
        filter: `client = "${clientId}"`,
        sort: '-created',
      });

      // Obtener premios canjeados desde PB de rewards
      const claims = await this.pbRewards.collection('reward_claims').getList(1, 10, {
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
      await this.ensureRewardsAuthenticated();

      // Validar que claimId sea válido
      if (!claimId) {
        return {
          success: false,
          message: '❌ ID de cupón inválido',
        };
      }

      // Obtener el claim original desde PB de rewards
      const claim = await this.pbRewards.collection('reward_claims').getOne(claimId);

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
          await this.authenticateClients();
          const client = await this.pbClients.collection('clients').getOne(claim.client);
          const reward = await this.pbRewards.collection('rewards').getOne(claim.reward);

          if (client.pointsBalance < reward.pointsCost) {
            return {
              success: false,
              message: `⚠️ Puntos insuficientes. Tiene ${client.pointsBalance}, necesita ${reward.pointsCost}`,
            };
          }

          // 1. Crear registro en points_transactions (Historial)
          try {
            await this.pbClients.collection('points_transactions').create({
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

          // 2. Actualizar saldo del cliente (Lógica de descuento) en PB de clientes
          await this.pbClients.collection('clients').update(claim.client, {
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

      // Actualizar el claim a 'redeemed' en PB de rewards
      const updatedClaim = await this.pbRewards.collection('reward_claims').update(claimId, {
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

  // Agregar puntos desde POS (al PB de clientes - pixel-pwa-backend)
  async addPointsFromPos(clientId, pointsToAdd, reason, _posOperator) {
    try {
      await this.ensureAuthenticated();
      await this.authenticateClients();
      
      const client = await this.pbClients.collection('clients').getOne(clientId);

      // Crear transacción de puntos en PB de clientes
      const transaction = await this.pbClients.collection('points_transactions').create({
        client: clientId,
        points: pointsToAdd,
        type: 'earn',
        description: reason || 'Compra en POS',
      });

      // Actualizar balance del cliente en PB de clientes
      const updatedClient = await this.pbClients.collection('clients').update(clientId, {
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

  // Obtener precio de un producto desde el PB del POS
  async getProductPrice(productId) {
    try {
      await this.ensureAuthenticated();
      const product = await this.pb.collection('products').getOne(productId);
      return {
        success: true,
        productId: product.id,
        name: product.name,
        price: Number(product.price || 0),
      };
    } catch (error) {
      console.error('Error obteniendo precio del producto:', error);
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  }

  // Calcular puntos desde precio del producto
  calculatePointsFromPrice(price) {
    return Math.floor(Number(price || 0) / POINTS_RATE);
  }

  // Canjear reward con precio dinámico (si tiene productId vinculado)
  async redeemRewardWithDynamicPrice(claimId, posOperator) {
    try {
      await this.ensureAuthenticated();
      await this.ensureRewardsAuthenticated();

      if (!claimId) {
        return { success: false, message: '❌ ID de cupón inválido' };
      }

      // Obtener el claim desde PB de rewards
      const claim = await this.pbRewards.collection('reward_claims').getOne(claimId);

      if (claim.status !== 'pending') {
        return { success: false, message: `❌ Cupón no está pendiente. Estado: ${claim.status}` };
      }

      // Obtener la reward para ver si tiene productId vinculado
      const reward = await this.pbRewards.collection('rewards').getOne(claim.reward);

      let dynamicPointsCost = null;
      let productPrice = null;
      let rewardTitle = reward.title;

      // Si la reward tiene un productId, obtener precio dinámico
      if (reward.productId) {
        const productResult = await this.getProductPrice(reward.productId);
        if (productResult.success) {
          productPrice = productResult.price;
          dynamicPointsCost = this.calculatePointsFromPrice(productPrice);
          console.log(`📦 Reward "${rewardTitle}" vinculada a producto: ${productResult.name} - $${productPrice}`);
          console.log(`💰 Puntos dinámicos calculados: ${dynamicPointsCost} (rate: ${POINTS_RATE})`);
        } else {
          console.warn('⚠️ No se pudo obtener precio del producto, usando pointsCost fijo');
          dynamicPointsCost = reward.pointsCost;
        }
      } else {
        dynamicPointsCost = reward.pointsCost;
      }

      let clientPoints = null;

      // Descontar puntos del cliente si aplica
      if (claim.client && dynamicPointsCost > 0) {
        await this.authenticateClients();
        const client = await this.pbClients.collection('clients').getOne(claim.client);

        if (client.pointsBalance < dynamicPointsCost) {
          return {
            success: false,
            message: `⚠️ Puntos insuficientes. Tiene ${client.pointsBalance}, necesita ${dynamicPointsCost}`,
          };
        }

        // Crear transacción
        await this.pbClients.collection('points_transactions').create({
          client: claim.client,
          points: -dynamicPointsCost,
          type: 'redeem',
          related_claim: claim.id,
          description: rewardTitle,
        });

        // Actualizar saldo
        await this.pbClients.collection('clients').update(claim.client, {
          pointsBalance: client.pointsBalance - dynamicPointsCost,
          last_reward_claimed: claim.reward,
          last_claim_date: new Date().toISOString(),
        });

        clientPoints = client.pointsBalance - dynamicPointsCost;
      }

      // Actualizar claim con los puntos reales usados y marcar como canjeado
      const updatedClaim = await this.pbRewards.collection('reward_claims').update(claimId, {
        status: 'redeemed',
        claimed_from: 'pos',
        pos_operator: posOperator,
        claimed_at: new Date().toISOString(),
        pos_location: 'main',
        pointsCost: dynamicPointsCost,
        productPrice: productPrice,
      });

      return {
        success: true,
        claim: updatedClaim,
        message: productPrice 
          ? `✅ Cupón "${rewardTitle}" canjeado ($${productPrice} → ${dynamicPointsCost} puntos)`
          : `✅ Cupón "${rewardTitle}" canjeado por ${dynamicPointsCost} puntos`,
        newBalance: clientPoints,
        rewardTitle: rewardTitle,
        dynamicPoints: dynamicPointsCost,
        productPrice: productPrice,
      };
    } catch (error) {
      console.error('Error canjeando cupón con precio dinámico:', error);
      return {
        success: false,
        message: `❌ Error al canjear: ${error.message}`,
      };
    }
  }

  // Verificar conexión con la app de puntos y rewards
  async testConnection() {
    try {
      // Autenticar en PB principal
      const authResult = await this.authenticate();
      if (!authResult.success) {
        return {
          success: false,
          message: authResult.message,
          url: POINTS_PB_URL,
          error: authResult.error,
        };
      }

      // Autenticar en PB de rewards
      const authRewardsResult = await this.authenticateRewards();
      if (!authRewardsResult.success) {
        return {
          success: false,
          message: `PB principal OK, pero error en rewards: ${authRewardsResult.message}`,
          url: POINTS_PB_URL,
          rewardsUrl: REWARDS_PB_URL,
          error: authRewardsResult.error,
        };
      }

      // Probar conexión a rewards
      await this.pbRewards.collection('rewards').getList(1, 1);
      
      return {
        success: true,
        message: '✅ Conectado a ambos: PB principal y Rewards',
        url: POINTS_PB_URL,
        rewardsUrl: REWARDS_PB_URL,
      };
    } catch (error) {
      console.log('❌ Error de conexión:', error);
      return {
        success: false,
        message: `❌ Error de conexión: ${error.message}`,
        url: POINTS_PB_URL,
        rewardsUrl: REWARDS_PB_URL,
        error: error.message,
      };
    }
  }
}

// Instancia global para usar en el POS
export const pointsApiClient = new PointsApiClient();
