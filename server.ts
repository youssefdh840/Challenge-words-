import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = 3000;

app.use(express.json());

// ================= GEOLOCATION UTILITIES =================

/**
 * Calculates Great-Circle Distance using Haversine formula (km)
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Estimates latency in ms based on fiber propagation and routing hops
 */
function estimateNetworkLatency(distanceKm: number): number {
  const baseOverhead = 20;
  const propagation = distanceKm * 0.0125;
  return Math.max(15, Math.round(baseOverhead + propagation));
}

// ================= MATCHMAKING ENGINE STATE =================

export interface QueuedPlayer {
  socketId: string;
  socket: Socket;
  user: {
    id: string;
    username: string;
    countryCode: string;
    countryName: string;
    countryFlag: string;
    city: string;
    latitude: number;
    longitude: number;
    avatar: string;
    xp: number;
    level: number;
    rankTitle: string;
  };
  preferredCountry?: string;
  joinedAt: number;
}

const matchmakingQueue: QueuedPlayer[] = [];
let totalCrossBorderMatchesFormed = 0;
let activeMatchesCount = 0;

// Curated question bank for server-authoritative matches
const SERVER_QUESTION_BANK = [
  {
    id: 'cq-1',
    type: 'country_quiz',
    prompt: 'Which Mediterranean country is famous for the ancient ruins of Carthage and the Amphitheatre of El Jem?',
    countryCode: 'TN',
    countryName: 'Tunisia',
    countryFlag: '🇹🇳',
    options: ['Tunisia', 'Morocco', 'Greece', 'Egypt'],
    correctAnswer: 'Tunisia',
    explanation: 'Tunisia houses ancient Carthage and El Jem colosseum, one of the best-preserved Roman amphitheaters.',
    culturalFact: 'In Tunisia, doors in Sidi Bou Said are famously painted deep Mediterranean blue with black stud patterns.',
  },
  {
    id: 'cq-2',
    type: 'country_quiz',
    prompt: 'This nation is famous for cherry blossom festivals (Sakura), bullet trains (Shinkansen), and Mount Fuji.',
    countryCode: 'JP',
    countryName: 'Japan',
    countryFlag: '🇯🇵',
    options: ['South Korea', 'China', 'Japan', 'Vietnam'],
    correctAnswer: 'Japan',
    explanation: 'Japan celebrates spring with Hanami flower-viewing parties under blossoming cherry trees.',
    culturalFact: 'Japan has more than 100,000 Shinto shrines and Buddhist temples across its archipelago.',
  },
  {
    id: 'cq-3',
    type: 'country_quiz',
    prompt: 'Which country has the largest portion of the Amazon Rainforest and the world-famous Carnaval in Rio?',
    countryCode: 'BR',
    countryName: 'Brazil',
    countryFlag: '🇧🇷',
    options: ['Colombia', 'Brazil', 'Argentina', 'Peru'],
    correctAnswer: 'Brazil',
    explanation: 'Brazil covers nearly half of the South American continent and houses over 60% of the Amazon rainforest.',
    culturalFact: 'Brazil is the only Portuguese-speaking country in the Americas, with vibrant cultural diversity.',
  },
  {
    id: 'gw-1',
    type: 'guess_word',
    prompt: 'What does the Japanese cultural philosophy "Ikigai" (生きがい) mean?',
    countryCode: 'JP',
    countryName: 'Japan',
    countryFlag: '🇯🇵',
    options: ['Reason for being / Life purpose', 'Transient beauty of cherry blossoms', 'Quiet tea ceremony mindfulness', 'Polite bowing greeting'],
    correctAnswer: 'Reason for being / Life purpose',
    explanation: 'Ikigai translates roughly to "the reason for which you get up in the morning".',
    culturalFact: 'In Okinawa, Japan, famous for high centenarian longevity, locals credit Ikigai for vitality.',
  },
  {
    id: 'mc-1',
    type: 'mystery_cuisine',
    prompt: 'Origin of Lablabi, a rich hearty spiced chickpea stew infused with cumin, garlic, olive oil, and harissa?',
    countryCode: 'TN',
    countryName: 'Tunisia',
    countryFlag: '🇹🇳',
    options: ['Tunisia', 'Jordan', 'Lebanon', 'Cyprus'],
    correctAnswer: 'Tunisia',
    explanation: 'Lablabi is an iconic Tunisian soul-food stew traditionally eaten in winter.',
    culturalFact: 'Diners tear pieces of day-old crusty bread into clay bowls before ladling piping hot chickpea broth.',
  },
];

/**
 * Cross-Border Matchmaking Pairing Loop
 * Evaluates queue according to:
 * 1. Primary Rule: Pair players from DIFFERENT countries/regions (Cross-Border Stamp Synergy)
 * 2. Distance/Latency Filter: Optimal ping
 * 3. 15-Second Fallback: If in queue >15s, broaden criteria to accept regional/same-country peers
 */
function processMatchmakingQueue(): void {
  if (matchmakingQueue.length < 2) return;

  const now = Date.now();

  for (let i = 0; i < matchmakingQueue.length; i++) {
    const playerA = matchmakingQueue[i];
    if (!playerA) continue;

    const waitTimeSec = (now - playerA.joinedAt) / 1000;
    const isFallbackActive = waitTimeSec >= 15; // 15-second queue fallback

    let bestMatchIndex = -1;
    let highestScore = -Infinity;

    for (let j = 0; j < matchmakingQueue.length; j++) {
      if (i === j) continue;
      const playerB = matchmakingQueue[j];
      if (!playerB) continue;

      const isDifferentCountry = playerA.user.countryCode !== playerB.user.countryCode;

      // Primary rule check: unless fallback is triggered (>15s), require different countries
      if (!isDifferentCountry && !isFallbackActive) {
        continue;
      }

      // Calculate geographic distance and estimated latency
      const distanceKm = haversineDistance(
        playerA.user.latitude,
        playerA.user.longitude,
        playerB.user.latitude,
        playerB.user.longitude
      );
      const pingMs = estimateNetworkLatency(distanceKm);

      // Scoring model:
      // +1000 for cross-border
      // +500 if requested country
      // - (pingMs * 1.2) for low latency preference
      let score = 0;
      if (isDifferentCountry) score += 1000;
      if (playerA.preferredCountry && playerB.user.countryCode === playerA.preferredCountry) {
        score += 500;
      }
      if (playerB.preferredCountry && playerA.user.countryCode === playerB.preferredCountry) {
        score += 500;
      }
      score -= pingMs * 1.2;

      if (score > highestScore) {
        highestScore = score;
        bestMatchIndex = j;
      }
    }

    if (bestMatchIndex !== -1) {
      // We found a match!
      const playerB = matchmakingQueue[bestMatchIndex];

      // Remove from queue (highest index first to avoid re-index issues)
      const indicesToRemove = [i, bestMatchIndex].sort((a, b) => b - a);
      indicesToRemove.forEach((idx) => matchmakingQueue.splice(idx, 1));

      // Calculate final match metadata
      const distanceKm = haversineDistance(
        playerA.user.latitude,
        playerA.user.longitude,
        playerB.user.latitude,
        playerB.user.longitude
      );
      const estimatedPingMs = estimateNetworkLatency(distanceKm);
      const isCrossBorder = playerA.user.countryCode !== playerB.user.countryCode;

      if (isCrossBorder) totalCrossBorderMatchesFormed++;
      activeMatchesCount++;

      const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const room = `room_${matchId}`;

      playerA.socket.join(room);
      playerB.socket.join(room);

      const matchPayload = {
        matchId,
        room,
        player1: playerA.user,
        player2: playerB.user,
        distanceKm,
        estimatedPingMs,
        crossBorderBonus: isCrossBorder,
        matchRoute: {
          p1Coords: [playerA.user.latitude, playerA.user.longitude],
          p2Coords: [playerB.user.latitude, playerB.user.longitude],
          p1City: playerA.user.city,
          p2City: playerB.user.city,
        },
        questions: SERVER_QUESTION_BANK,
      };

      io.to(room).emit('match_found', matchPayload);
      console.log(`[Matchmaker] Paired ${playerA.user.username} (${playerA.user.countryCode}) with ${playerB.user.username} (${playerB.user.countryCode}) • Dist: ${distanceKm}km • Ping: ${estimatedPingMs}ms`);
      break;
    }
  }
}

// Run matchmaking evaluation loop every 1.5s
setInterval(processMatchmakingQueue, 1500);

// ================= SOCKET.IO REALTIME EVENTS =================

io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('join_matchmaking', (payload) => {
    // Remove if already in queue
    const existingIdx = matchmakingQueue.findIndex((p) => p.socketId === socket.id);
    if (existingIdx !== -1) matchmakingQueue.splice(existingIdx, 1);

    const queuedPlayer: QueuedPlayer = {
      socketId: socket.id,
      socket,
      user: {
        id: payload.user?.id || `usr_${socket.id.substring(0, 6)}`,
        username: payload.user?.username || 'Diplomat',
        countryCode: payload.user?.countryCode || 'TN',
        countryName: payload.user?.countryName || 'Tunisia',
        countryFlag: payload.user?.countryFlag || '🇹🇳',
        city: payload.user?.city || 'Tunis',
        latitude: Number(payload.user?.latitude || 36.8065),
        longitude: Number(payload.user?.longitude || 10.1815),
        avatar: payload.user?.avatar || '🧭',
        xp: Number(payload.user?.xp || 300),
        level: Number(payload.user?.level || 2),
        rankTitle: payload.user?.rankTitle || 'Explorer',
      },
      preferredCountry: payload.preferredCountry || undefined,
      joinedAt: Date.now(),
    };

    matchmakingQueue.push(queuedPlayer);
    socket.emit('queue_joined', {
      position: matchmakingQueue.length,
      estimatedWaitSec: 3,
    });

    console.log(`[Queue] ${queuedPlayer.user.username} (${queuedPlayer.user.countryCode}) joined queue. Total in queue: ${matchmakingQueue.length}`);
    processMatchmakingQueue();
  });

  socket.on('leave_matchmaking', () => {
    const idx = matchmakingQueue.findIndex((p) => p.socketId === socket.id);
    if (idx !== -1) {
      matchmakingQueue.splice(idx, 1);
      socket.emit('queue_left');
      console.log(`[Queue] Client ${socket.id} left queue. Total: ${matchmakingQueue.length}`);
    }
  });

  socket.on('disconnect', () => {
    const idx = matchmakingQueue.findIndex((p) => p.socketId === socket.id);
    if (idx !== -1) matchmakingQueue.splice(idx, 1);
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ================= REST API ROUTES =================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Passage Cross-Border Matchmaker & Geolocation Engine',
    timestamp: new Date().toISOString(),
  });
});

// GeoIP Fallback endpoint
app.get('/api/geoip', (req, res) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || '127.0.0.1';

  // Return location metadata with safe default
  res.json({
    ip,
    country_code: 'TN',
    country_name: 'Tunisia',
    city: 'Tunis',
    latitude: 36.8065,
    longitude: 10.1815,
    timezone: 'Africa/Tunis',
    capture_method: 'ip_fallback',
  });
});

// Matchmaking telemetry statistics
app.get('/api/matchmaking/stats', (req, res) => {
  res.json({
    queuedPlayersCount: matchmakingQueue.length,
    activeMatchesCount,
    totalCrossBorderMatchesFormed,
    rules: {
      primaryRule: 'Different Country/Region pairing prioritized for Passport Stamp unlocking',
      distanceFilter: 'Haversine Great-Circle distance + fiber latency optimization',
      fallbackTimeoutSeconds: 15,
    },
  });
});

// ================= VITE MIDDLEWARE SETUP =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Passage Geolocation & Matchmaking Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
