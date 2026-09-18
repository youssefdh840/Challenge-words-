import {
  ActiveMatch,
  GameQuestion,
  PassportStamp,
  PlayerRoundAnswer,
  StampInkColor,
  UserProfile,
} from '../types';
import { QUESTIONS } from '../data/questions';
import { COUNTRIES } from '../data/countries';
import { OPPONENT_POOL } from '../data/initialData';
import { GLOBAL_LOBBY_PEERS } from '../data/activePeers';
import {
  calculateHaversineDistanceKm,
  estimatePingMs,
  locationService,
  WORLD_CITIES_REGISTRY,
} from './locationService';
import { soundEngine } from './soundEngine';
import { io, Socket } from 'socket.io-client';

export interface WebSocketPacket {
  id: string;
  timestamp: string;
  direction: 'client_to_server' | 'server_to_client';
  event: string;
  payload: unknown;
}

export type GameEventListener = (match: ActiveMatch) => void;
export type PacketListener = (packet: WebSocketPacket) => void;

class GameEngine {
  private currentMatch: ActiveMatch | null = null;
  private timerInterval: number | null = null;
  private opponentAnswerTimeout: number | null = null;
  private searchTimeout: number | null = null;
  private eventListeners: GameEventListener[] = [];
  private packetListeners: PacketListener[] = [];
  private recentPackets: WebSocketPacket[] = [];
  private socket: Socket | null = null;
  private searchStartTime = 0;

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    try {
      if (typeof window !== 'undefined') {
        this.socket = io(window.location.origin, {
          transports: ['websocket', 'polling'],
          timeout: 4000,
          reconnectionAttempts: 3,
        });

        this.socket.on('connect', () => {
          this.logPacket('client_to_server', 'SOCKET_CONNECTED', { socketId: this.socket?.id });
        });

        this.socket.on('match_found', (data) => {
          this.logPacket('server_to_client', 'MATCH_FOUND', data);
        });

        this.socket.on('disconnect', () => {
          this.logPacket('server_to_client', 'SOCKET_DISCONNECTED', {});
        });
      }
    } catch {
      // In standalone client or sandbox environment, client engine handles gracefully
    }
  }

  public subscribe(listener: GameEventListener): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter((l) => l !== listener);
    };
  }

  public subscribePackets(listener: PacketListener): () => void {
    this.packetListeners.push(listener);
    return () => {
      this.packetListeners = this.packetListeners.filter((l) => l !== listener);
    };
  }

  public getRecentPackets(): WebSocketPacket[] {
    return this.recentPackets;
  }

  private logPacket(direction: 'client_to_server' | 'server_to_client', event: string, payload: unknown) {
    const packet: WebSocketPacket = {
      id: 'pkt-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      direction,
      event,
      payload,
    };
    this.recentPackets = [packet, ...this.recentPackets].slice(0, 30);
    this.packetListeners.forEach((fn) => fn(packet));
  }

  private notify() {
    if (this.currentMatch) {
      const copy = { ...this.currentMatch };
      this.eventListeners.forEach((fn) => fn(copy));
    }
  }

  // Pick random questions ensuring diverse mini-game variety
  private selectQuestionsForMatch(count = 5): GameQuestion[] {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    const picked: GameQuestion[] = [];
    const typesSeen = new Set<string>();

    for (const q of shuffled) {
      if (!typesSeen.has(q.type) && picked.length < count) {
        picked.push(q);
        typesSeen.add(q.type);
      }
    }
    for (const q of shuffled) {
      if (picked.length < count && !picked.includes(q)) {
        picked.push(q);
      }
    }
    return picked.slice(0, count);
  }

  // Start Matchmaking with Geolocation & Regional Cross-Border Priority
  public startMatchmaking(player: UserProfile, preferredOpponentCountry?: string): void {
    this.clearTimers();
    this.searchStartTime = Date.now();

    const userLoc = player.location || locationService.getLocation();

    this.logPacket('client_to_server', 'MATCHMAKING_QUEUE_JOIN', {
      playerId: player.id,
      username: player.username,
      country: player.countryCode,
      coordinates: { lat: userLoc.latitude, lon: userLoc.longitude },
      preferredOpponentCountry,
      timestamp: new Date().toISOString(),
    });

    if (this.socket && this.socket.connected) {
      this.socket.emit('join_matchmaking', {
        user: {
          id: player.id,
          username: player.username,
          countryCode: player.countryCode,
          countryName: player.countryName,
          countryFlag: player.countryFlag,
          city: userLoc.city,
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
          avatar: player.avatar,
          xp: player.xp,
          level: player.level,
          rankTitle: player.rankTitle,
        },
        preferredCountry: preferredOpponentCountry,
      });
    }

    const matchQuestions = this.selectQuestionsForMatch(5);

    // Initial placeholder match in searching state
    const newMatch: ActiveMatch = {
      matchId: 'match-' + Math.random().toString(36).substring(2, 9),
      player1: player,
      player2: OPPONENT_POOL[0],
      questions: matchQuestions,
      currentRoundIndex: 0,
      totalRounds: matchQuestions.length,
      status: 'searching',
      roundDurationSec: 12,
      timeRemainingSec: 12,
      player1Score: 0,
      player2Score: 0,
      player1Streak: 0,
      player2Streak: 0,
      player1CurrentAnswer: null,
      player2CurrentAnswer: null,
      roundHistory: [],
      winnerId: null,
      isDraw: false,
      stampsAwarded: [],
      xpAwarded: { player1: 0, player2: 0 },
    };

    this.currentMatch = newMatch;
    this.notify();

    // Matchmaking loop simulation with latency & cross-border filtering
    this.searchTimeout = window.setTimeout(() => {
      if (!this.currentMatch || this.currentMatch.status !== 'searching') return;

      const elapsedSec = (Date.now() - this.searchStartTime) / 1000;
      const allowRegionalFallback = elapsedSec >= 15;

      // 1. Filter candidates: Primary Rule is DIFFERENT country to unlock stamps
      let candidatePool = OPPONENT_POOL.filter((o) => o.countryCode !== player.countryCode);

      if (preferredOpponentCountry) {
        const preferred = candidatePool.find((c) => c.countryCode === preferredOpponentCountry);
        if (preferred) candidatePool = [preferred];
      }

      // If no international peer found and >=15s fallback triggered, broaden to all peers
      if (candidatePool.length === 0 && allowRegionalFallback) {
        candidatePool = OPPONENT_POOL;
        this.logPacket('server_to_client', 'MATCHMAKING_FALLBACK_BROADENED', {
          reason: '15s timeout reached, broadening to regional pool',
        });
      }

      // 2. Score candidates by latency + diversity
      let bestCandidate = candidatePool[0] || OPPONENT_POOL[0];
      let bestScore = -Infinity;

      for (const cand of candidatePool) {
        const candPeer = GLOBAL_LOBBY_PEERS.find((p) => p.countryCode === cand.countryCode);
        const candCity = WORLD_CITIES_REGISTRY.find((c) => c.countryCode === cand.countryCode);
        const candLat = candPeer?.latitude ?? candCity?.latitude ?? 35.6762;
        const candLon = candPeer?.longitude ?? candCity?.longitude ?? 139.6503;

        const distance = calculateHaversineDistanceKm(
          userLoc.latitude,
          userLoc.longitude,
          candLat,
          candLon
        );
        const ping = estimatePingMs(distance);

        // Optimal latency score + different country bonus
        let score = (cand.countryCode !== player.countryCode ? 1000 : 0) - ping * 1.2;
        if (preferredOpponentCountry && cand.countryCode === preferredOpponentCountry) {
          score += 500;
        }

        if (score > bestScore) {
          bestScore = score;
          bestCandidate = cand;
        }
      }

      const opponentPeer = GLOBAL_LOBBY_PEERS.find((p) => p.countryCode === bestCandidate.countryCode);
      const opponentCity = WORLD_CITIES_REGISTRY.find((c) => c.countryCode === bestCandidate.countryCode);
      const oppLat = opponentPeer?.latitude ?? opponentCity?.latitude ?? 35.6762;
      const oppLon = opponentPeer?.longitude ?? opponentCity?.longitude ?? 139.6503;

      const finalDistanceKm = calculateHaversineDistanceKm(
        userLoc.latitude,
        userLoc.longitude,
        oppLat,
        oppLon
      );
      const finalPingMs = estimatePingMs(finalDistanceKm);
      const isCrossBorder = bestCandidate.countryCode !== player.countryCode;

      this.currentMatch.player2 = bestCandidate;
      this.currentMatch.distanceKm = finalDistanceKm;
      this.currentMatch.estimatedPingMs = finalPingMs;
      this.currentMatch.crossBorderBonus = isCrossBorder;
      this.currentMatch.matchRoute = {
        p1Coords: [userLoc.latitude, userLoc.longitude],
        p2Coords: [oppLat, oppLon],
        p1City: userLoc.city,
        p2City: opponentPeer?.city || opponentCity?.city || bestCandidate.countryName,
      };

      this.currentMatch.status = 'matched';
      this.logPacket('server_to_client', 'MATCH_FOUND', {
        matchId: this.currentMatch.matchId,
        room: `room_${this.currentMatch.matchId}`,
        player1: { username: player.username, country: player.countryCode, city: userLoc.city },
        player2: {
          username: bestCandidate.username,
          country: bestCandidate.countryCode,
          city: this.currentMatch.matchRoute.p2City,
        },
        distanceKm: finalDistanceKm,
        estimatedPingMs: finalPingMs,
        crossBorderBonus: isCrossBorder,
        passportStampEligible: isCrossBorder,
      });

      this.notify();

      // Begin countdown to round 1
      setTimeout(() => {
        this.startNextRound();
      }, 2400);
    }, 1800);
  }

  // Start Next Round
  private startNextRound(): void {
    if (!this.currentMatch) return;

    const roundIdx = this.currentMatch.currentRoundIndex;
    const currentQ = this.currentMatch.questions[roundIdx];

    this.currentMatch.status = 'playing_round';
    this.currentMatch.timeRemainingSec = 12;
    this.currentMatch.player1CurrentAnswer = null;
    this.currentMatch.player2CurrentAnswer = null;

    this.logPacket('server_to_client', 'ROUND_START', {
      roundIndex: roundIdx + 1,
      totalRounds: this.currentMatch.totalRounds,
      questionId: currentQ.id,
      type: currentQ.type,
      prompt: currentQ.prompt,
      country: currentQ.countryName,
      timeLimitSec: 12,
    });

    this.notify();

    // If it's a sound quiz, play sound automatically
    if (currentQ.type === 'sound_quiz' && currentQ.soundData?.notes) {
      setTimeout(() => {
        soundEngine.playMelody(currentQ.soundData!.notes!);
      }, 500);
    }

    // Schedule Opponent Answer Simulation (Realistic response time: 2.2s - 5.5s)
    this.scheduleOpponentResponse(currentQ);

    // Start Round Timer
    this.startTimer();
  }

  private startTimer(): void {
    this.clearTimers(false); // keep opponent timeout
    this.timerInterval = window.setInterval(() => {
      if (!this.currentMatch) return;

      if (this.currentMatch.timeRemainingSec <= 1) {
        this.clearTimers();
        this.resolveRound();
      } else {
        this.currentMatch.timeRemainingSec -= 1;
        if (this.currentMatch.timeRemainingSec <= 3) {
          soundEngine.playTick();
        }
        this.notify();
      }
    }, 1000);
  }

  private scheduleOpponentResponse(question: GameQuestion): void {
    if (this.opponentAnswerTimeout) clearTimeout(this.opponentAnswerTimeout);

    // Reaction time between 2200ms and 5200ms
    const reactionTime = 2200 + Math.random() * 3000;
    this.opponentAnswerTimeout = window.setTimeout(() => {
      if (!this.currentMatch || this.currentMatch.status !== 'playing_round') return;

      // 75% chance of correct answer
      const isCorrect = Math.random() < 0.75;
      let chosenOption = question.correctAnswer;
      if (!isCorrect) {
        const wrongChoices = question.options.filter((o) => o !== question.correctAnswer);
        chosenOption = wrongChoices[Math.floor(Math.random() * wrongChoices.length)] || question.options[0];
      }

      const points = isCorrect
        ? 100 + Math.max(0, Math.round((12 - reactionTime / 1000) * 4))
        : 0;

      const oppAnswer: PlayerRoundAnswer = {
        option: chosenOption,
        timeTakenMs: Math.round(reactionTime),
        isCorrect,
        pointsAwarded: points,
      };

      this.currentMatch.player2CurrentAnswer = oppAnswer;
      this.currentMatch.player2Score += points;
      if (isCorrect) {
        this.currentMatch.player2Streak += 1;
      } else {
        this.currentMatch.player2Streak = 0;
      }

      this.logPacket('server_to_client', 'OPPONENT_ANSWER_SUBMITTED', {
        timeTakenMs: oppAnswer.timeTakenMs,
        isCorrect: oppAnswer.isCorrect,
        opponentNewScore: this.currentMatch.player2Score,
      });

      this.notify();

      // If both players have answered, resolve round early!
      if (this.currentMatch.player1CurrentAnswer) {
        this.resolveRound();
      }
    }, reactionTime);
  }

  // Player 1 submits answer
  public submitPlayerAnswer(selectedOption: string): void {
    if (!this.currentMatch || this.currentMatch.status !== 'playing_round') return;
    if (this.currentMatch.player1CurrentAnswer) return; // already answered

    const roundIdx = this.currentMatch.currentRoundIndex;
    const currentQ = this.currentMatch.questions[roundIdx];
    const timeTakenMs = Math.round((12 - this.currentMatch.timeRemainingSec) * 1000);

    const isCorrect = selectedOption.toLowerCase() === currentQ.correctAnswer.toLowerCase();
    const speedBonus = isCorrect ? Math.round(this.currentMatch.timeRemainingSec * 4) : 0;
    const streakBonus = isCorrect && this.currentMatch.player1Streak >= 1 ? 25 : 0;
    const points = isCorrect ? 100 + speedBonus + streakBonus : 0;

    if (isCorrect) {
      soundEngine.playCorrect();
      this.currentMatch.player1Streak += 1;
    } else {
      soundEngine.playIncorrect();
      this.currentMatch.player1Streak = 0;
    }

    const answer: PlayerRoundAnswer = {
      option: selectedOption,
      timeTakenMs,
      isCorrect,
      pointsAwarded: points,
    };

    this.currentMatch.player1CurrentAnswer = answer;
    this.currentMatch.player1Score += points;

    this.logPacket('client_to_server', 'SUBMIT_ANSWER', {
      questionId: currentQ.id,
      selectedOption,
      timeTakenMs,
      clientCalculatedPoints: points,
    });

    this.notify();

    // If opponent already answered, resolve now
    if (this.currentMatch.player2CurrentAnswer) {
      this.resolveRound();
    }
  }

  // Resolve Round
  private resolveRound(): void {
    this.clearTimers();
    if (!this.currentMatch) return;

    this.currentMatch.status = 'round_review';
    const roundIdx = this.currentMatch.currentRoundIndex;
    const currentQ = this.currentMatch.questions[roundIdx];

    // Record round history
    this.currentMatch.roundHistory.push({
      questionId: currentQ.id,
      player1Answer: this.currentMatch.player1CurrentAnswer,
      player2Answer: this.currentMatch.player2CurrentAnswer,
    });

    this.logPacket('server_to_client', 'ROUND_RESOLVED', {
      roundIndex: roundIdx + 1,
      correctAnswer: currentQ.correctAnswer,
      explanation: currentQ.explanation,
      culturalFact: currentQ.culturalFact,
      player1Score: this.currentMatch.player1Score,
      player2Score: this.currentMatch.player2Score,
    });

    this.notify();

    // Wait 4.5 seconds for players to read cultural explanation & review scores, then proceed
    setTimeout(() => {
      if (!this.currentMatch) return;

      if (this.currentMatch.currentRoundIndex < this.currentMatch.totalRounds - 1) {
        this.currentMatch.currentRoundIndex += 1;
        this.startNextRound();
      } else {
        this.finishMatch();
      }
    }, 4500);
  }

  // Finish Match & Award Stamps / XP
  private finishMatch(): void {
    this.clearTimers();
    if (!this.currentMatch) return;

    this.currentMatch.status = 'match_finished';

    const p1Score = this.currentMatch.player1Score;
    const p2Score = this.currentMatch.player2Score;
    const playerWon = p1Score > p2Score;
    const isDraw = p1Score === p2Score;

    this.currentMatch.winnerId = playerWon
      ? this.currentMatch.player1.id
      : isDraw
      ? null
      : this.currentMatch.player2.id;
    this.currentMatch.isDraw = isDraw;

    // Calculate XP
    const p1XP = 50 + (playerWon ? 120 : isDraw ? 70 : 40) + Math.round(p1Score / 10);
    const p2XP = 50 + (!playerWon && !isDraw ? 120 : isDraw ? 70 : 40) + Math.round(p2Score / 10);

    this.currentMatch.xpAwarded = {
      player1: p1XP,
      player2: p2XP,
    };

    // If player won or drew, award the opponent's country stamp in the Virtual Passport!
    const stamps: PassportStamp[] = [];
    const opp = this.currentMatch.player2;
    const countryData = COUNTRIES[opp.countryCode] || COUNTRIES.TN;

    const inkColors: StampInkColor[] = ['crimson', 'navy', 'emerald', 'sepia', 'violet'];
    const chosenInk = inkColors[Math.floor(Math.random() * inkColors.length)];

    const stamp: PassportStamp = {
      id: 'stamp-' + Date.now(),
      countryCode: opp.countryCode,
      countryName: opp.countryName,
      countryFlag: opp.countryFlag,
      acquiredAt: new Date().toISOString().split('T')[0],
      unlockedBy: playerWon ? 'victory' : 'cultural_exchange',
      opponentName: opp.username,
      opponentCountry: `${opp.countryName} ${opp.countryFlag}`,
      inkColor: chosenInk,
      capital: countryData.capital,
      language: countryData.primaryLanguage,
      culturalFact: countryData.culturalHighlight,
      famousLandmark: countryData.famousLandmark,
      coordinates: `${Math.floor(Math.random() * 60)}° N, ${Math.floor(Math.random() * 120)}° E`,
    };

    stamps.push(stamp);
    this.currentMatch.stampsAwarded = stamps;

    this.logPacket('server_to_client', 'MATCH_COMPLETED', {
      winnerId: this.currentMatch.winnerId,
      finalScores: { player1: p1Score, player2: p2Score },
      stampAwarded: stamp,
      xpGained: p1XP,
    });

    if (playerWon) {
      soundEngine.playVictory();
    }

    this.notify();
  }

  public leaveMatch(): void {
    this.clearTimers();
    this.currentMatch = null;
    this.logPacket('client_to_server', 'MATCH_LEAVE', {});
    this.eventListeners.forEach((fn) => fn(null as unknown as ActiveMatch));
  }

  private clearTimers(clearOpponent = true): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (clearOpponent && this.opponentAnswerTimeout) {
      clearTimeout(this.opponentAnswerTimeout);
      this.opponentAnswerTimeout = null;
    }
  }
}

export const gameEngine = new GameEngine();
