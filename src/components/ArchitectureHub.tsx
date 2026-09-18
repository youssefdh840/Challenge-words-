import React, { useState, useEffect } from 'react';
import {
  Shield,
  Database,
  Network,
  Code2,
  Copy,
  Check,
  Server,
  Layers,
  Activity,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { gameEngine, WebSocketPacket } from '../services/gameEngine';

export const ArchitectureHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'architecture' | 'schema' | 'realtime' | 'starter_code'>('architecture');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [livePackets, setLivePackets] = useState<WebSocketPacket[]>([]);

  useEffect(() => {
    setLivePackets(gameEngine.getRecentPackets());
    const unsub = gameEngine.subscribePackets((pkt) => {
      setLivePackets((prev) => [pkt, ...prev].slice(0, 20));
    });
    return unsub;
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // SQL DDL SCRIPT
  const sqlDdlCode = `-- =========================================================
-- WORLD CHALLENGE: ACADEMIC DATABASE SCHEMA (PostgreSQL 15+)
-- Terminale NSI / High School CS Project Submission
-- Normalized to 3rd Normal Form (3NF) with Foreign Key Cascades
-- =========================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE minigame_type AS ENUM (
  'country_quiz',
  'guess_word',
  'mystery_cuisine',
  'sound_quiz',
  'map_speed_test'
);

CREATE TYPE match_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'abandoned'
);

CREATE TYPE stamp_unlock_reason AS ENUM (
  'victory',
  'cultural_exchange'
);

-- 2. USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  country_code CHAR(2) NOT NULL, -- ISO 3166-1 alpha-2 (e.g. 'TN', 'FR', 'JP')
  country_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  rank_title VARCHAR(100) DEFAULT 'Novice Explorer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. VIRTUAL PASSPORTS TABLE (1-to-1 with Users)
CREATE TABLE passports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  passport_number VARCHAR(30) UNIQUE NOT NULL, -- e.g. 'WC-TN-2026-894'
  issue_date DATE DEFAULT CURRENT_DATE,
  total_stamps_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PASSPORT STAMPS TABLE (Many-to-1 with Passports)
CREATE TABLE passport_stamps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passport_id UUID NOT NULL REFERENCES passports(id) ON DELETE CASCADE,
  country_code CHAR(2) NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  capital VARCHAR(100) NOT NULL,
  ink_color VARCHAR(20) DEFAULT 'crimson',
  unlocked_reason stamp_unlock_reason DEFAULT 'victory',
  opponent_username VARCHAR(50),
  opponent_country_code CHAR(2),
  coordinates VARCHAR(50),
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_passport_country UNIQUE (passport_id, country_code)
);

-- 5. QUESTIONS BANK TABLE
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type minigame_type NOT NULL,
  country_code CHAR(2) NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 strings e.g. ["Tunisia", "France", "Japan", "Brazil"]
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  cultural_fact TEXT NOT NULL,
  sound_metadata JSONB,   -- Optional melody frequencies or voice cues
  map_coordinates JSONB,  -- Optional {x: 51.5, y: 38.5} for map test
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. MATCHES TABLE
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player1_id UUID NOT NULL REFERENCES users(id),
  player2_id UUID NOT NULL REFERENCES users(id),
  winner_id UUID REFERENCES users(id),
  is_draw BOOLEAN DEFAULT FALSE,
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  player1_xp_awarded INTEGER DEFAULT 0,
  player2_xp_awarded INTEGER DEFAULT 0,
  status match_status DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT distinct_players CHECK (player1_id <> player2_id)
);

-- 7. MATCH ROUNDS (Audit / Detailed Round History)
CREATE TABLE match_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number >= 1),
  question_id UUID NOT NULL REFERENCES questions(id),
  p1_selected_option TEXT,
  p1_time_ms INTEGER,
  p1_is_correct BOOLEAN,
  p1_points INTEGER DEFAULT 0,
  p2_selected_option TEXT,
  p2_time_ms INTEGER,
  p2_is_correct BOOLEAN,
  p2_points INTEGER DEFAULT 0,
  resolved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. INDEXES FOR HIGH-THROUGHPUT MATCHMAKING & QUERIES
CREATE INDEX idx_users_xp ON users(xp DESC);
CREATE INDEX idx_users_country ON users(country_code);
CREATE INDEX idx_stamps_passport ON passport_stamps(passport_id);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_matches_players ON matches(player1_id, player2_id);
`;

  // PRISMA SCHEMA
  const prismaSchemaCode = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum MiniGameType {
  country_quiz
  guess_word
  mystery_cuisine
  sound_quiz
  map_speed_test
}

enum MatchStatus {
  pending
  in_progress
  completed
  abandoned
}

model User {
  id           String    @id @default(uuid())
  username     String    @unique
  email        String    @unique
  passwordHash String
  countryCode  String    @db.Char(2)
  countryName  String
  avatarUrl    String?
  xp           Int       @default(0)
  level        Int       @default(1)
  rankTitle    String    @default("Novice Explorer")
  passport     Passport?
  matchesAsP1  Match[]   @relation("Player1Matches")
  matchesAsP2  Match[]   @relation("Player2Matches")
  createdAt    DateTime  @default(now())

  @@index([xp(sort: Desc)])
}

model Passport {
  id               String          @id @default(uuid())
  userId           String          @unique
  user             User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  passportNumber   String          @unique
  issueDate        DateTime        @default(now())
  stamps           PassportStamp[]
  totalStampsCount Int             @default(0)
}

model PassportStamp {
  id               String   @id @default(uuid())
  passportId       String
  passport         Passport @relation(fields: [passportId], references: [id], onDelete: Cascade)
  countryCode      String   @db.Char(2)
  countryName      String
  capital          String
  inkColor         String   @default("crimson")
  unlockedReason   String   @default("victory")
  opponentUsername String?
  acquiredAt       DateTime @default(now())

  @@unique([passportId, countryCode])
}

model Question {
  id             String       @id @default(uuid())
  type           MiniGameType
  countryCode    String       @db.Char(2)
  prompt         String
  options        Json         // string[]
  correctAnswer  String
  explanation    String
  culturalFact   String
  soundMetadata  Json?
  mapCoordinates Json?
  rounds         MatchRound[]
}

model Match {
  id           String       @id @default(uuid())
  player1Id    String
  player2Id    String
  player1      User         @relation("Player1Matches", fields: [player1Id], references: [id])
  player2      User         @relation("Player2Matches", fields: [player2Id], references: [id])
  winnerId     String?
  isDraw       Boolean      @default(false)
  player1Score Int          @default(0)
  player2Score Int          @default(0)
  status       MatchStatus  @default(pending)
  rounds       MatchRound[]
  startedAt    DateTime     @default(now())
  endedAt      DateTime?
}

model MatchRound {
  id           String   @id @default(uuid())
  matchId      String
  match        Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)
  roundNumber  Int
  questionId   String
  question     Question @relation(fields: [questionId], references: [id])
  p1Answer     String?
  p1TimeMs     Int?
  p1IsCorrect  Boolean?
  p2Answer     String?
  p2TimeMs     Int?
  p2IsCorrect  Boolean?
}
`;

  // NODE.JS SOCKET.IO SERVER SETUP
  const socketServerCode = `// server.js - Node.js + Socket.io Server-Authoritative Architecture
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// In-Memory Matchmaking Queue & Active Game Rooms
const matchmakingQueue = [];
const activeRooms = new Map(); // roomId => GameState

// 1. MATCHMAKING WORKER
function processMatchmaking() {
  while (matchmakingQueue.length >= 2) {
    const p1 = matchmakingQueue.shift();
    const p2 = matchmakingQueue.shift();

    const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    p1.socket.join(roomId);
    p2.socket.join(roomId);

    const questions = selectRandomCulturalQuestions(5);

    const matchState = {
      roomId,
      player1: { id: p1.userId, username: p1.username, country: p1.country, score: 0, streak: 0, socketId: p1.socket.id },
      player2: { id: p2.userId, username: p2.username, country: p2.country, score: 0, streak: 0, socketId: p2.socket.id },
      questions,
      currentRound: 0,
      totalRounds: 5,
      roundTimeout: null,
      p1Answer: null,
      p2Answer: null,
      roundStartTime: 0
    };

    activeRooms.set(roomId, matchState);

    io.to(roomId).emit('MATCH_FOUND', {
      roomId,
      opponent1: { username: p1.username, country: p1.country },
      opponent2: { username: p2.username, country: p2.country }
    });

    setTimeout(() => startRound(roomId), 2500);
  }
}

// 2. AUTHORITATIVE ROUND DISPATCHER
function startRound(roomId) {
  const match = activeRooms.get(roomId);
  if (!match) return;

  const q = match.questions[match.currentRound];
  match.p1Answer = null;
  match.p2Answer = null;
  match.roundStartTime = Date.now();

  io.to(roomId).emit('ROUND_START', {
    roundIndex: match.currentRound + 1,
    totalRounds: match.totalRounds,
    question: {
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      soundData: q.soundData,
      mapTarget: q.mapTarget
    },
    durationSec: 12
  });

  // Server Authoritative Timeout
  match.roundTimeout = setTimeout(() => {
    resolveRound(roomId);
  }, 12000);
}

// 3. SERVER AUTHORITATIVE ANSWER VALIDATION
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('JOIN_QUEUE', (data) => {
    matchmakingQueue.push({ socket, ...data });
    processMatchmaking();
  });

  socket.on('SUBMIT_ANSWER', ({ roomId, selectedOption }) => {
    const match = activeRooms.get(roomId);
    if (!match) return;

    const isP1 = socket.id === match.player1.socketId;
    const currentQ = match.questions[match.currentRound];
    const timeTakenMs = Date.now() - match.roundStartTime;

    // Server-side validation: NEVER trust client correctness
    const isCorrect = selectedOption === currentQ.correctAnswer;
    const speedBonus = isCorrect ? Math.max(0, Math.round((12000 - timeTakenMs) / 1000 * 4)) : 0;
    const points = isCorrect ? 100 + speedBonus : 0;

    const answerRecord = { option: selectedOption, timeTakenMs, isCorrect, points };

    if (isP1) {
      if (match.p1Answer) return; // Prevent double submits
      match.p1Answer = answerRecord;
      match.player1.score += points;
      match.player1.streak = isCorrect ? match.player1.streak + 1 : 0;
    } else {
      if (match.p2Answer) return;
      match.p2Answer = answerRecord;
      match.player2.score += points;
      match.player2.streak = isCorrect ? match.player2.streak + 1 : 0;
    }

    // Broadcast that player answered (without revealing correctness to opponent yet)
    socket.to(roomId).emit('OPPONENT_ANSWERED', { timeTakenMs });

    // If both players have answered before timer, resolve early!
    if (match.p1Answer && match.p2Answer) {
      clearTimeout(match.roundTimeout);
      resolveRound(roomId);
    }
  });

  socket.on('disconnect', () => {
    const idx = matchmakingQueue.findIndex((p) => p.socket.id === socket.id);
    if (idx !== -1) matchmakingQueue.splice(idx, 1);
  });
});

// 4. ROUND RESOLUTION & PASSPORT STAMP DISPATCH
function resolveRound(roomId) {
  const match = activeRooms.get(roomId);
  if (!match) return;

  const currentQ = match.questions[match.currentRound];

  io.to(roomId).emit('ROUND_RESOLVED', {
    correctAnswer: currentQ.correctAnswer,
    explanation: currentQ.explanation,
    culturalFact: currentQ.culturalFact,
    player1Score: match.player1.score,
    player2Score: match.player2.score
  });

  match.currentRound += 1;

  if (match.currentRound < match.totalRounds) {
    setTimeout(() => startRound(roomId), 4000);
  } else {
    finishMatch(roomId);
  }
}

function finishMatch(roomId) {
  const match = activeRooms.get(roomId);
  if (!match) return;

  const winner = match.player1.score > match.player2.score ? 'player1' :
                 match.player2.score > match.player1.score ? 'player2' : 'draw';

  io.to(roomId).emit('MATCH_COMPLETED', {
    winner,
    p1Score: match.player1.score,
    p2Score: match.player2.score,
    p1StampAwarded: { country: match.player2.country, date: new Date() },
    p2StampAwarded: { country: match.player1.country, date: new Date() }
  });

  activeRooms.delete(roomId);
}

server.listen(3000, () => console.log('World Challenge Socket Server running on port 3000'));
`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
            <Shield className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Academic Assessment & Architecture Hub
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl">
          High School Computer Science (Terminale NSI) technical dossier: Recommended stack, 3NF Entity-Relationship Diagram (ERD), real-time WebSocket protocol sequence, and production starter implementations.
        </p>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveSubTab('architecture')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'architecture'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. System Architecture</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('schema')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'schema'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>2. Relational Schema & ERD</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('realtime')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'realtime'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>3. Real-Time Logic & WebSocket Flow</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('starter_code')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'starter_code'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>4. Starter Code & DDL Exporter</span>
        </button>
      </div>

      {/* ================= SECTION 1: ARCHITECTURE OVERVIEW ================= */}
      {activeSubTab === 'architecture' && (
        <div className="space-y-6">
          {/* Tech Stack Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Backend Service</h3>
              <p className="text-xs text-slate-400 mt-1">
                Node.js + Express + Socket.io (or Python FastAPI + WebSockets). Server-authoritative state engine handles timers and answer validation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Frontend Client</h3>
              <p className="text-xs text-slate-400 mt-1">
                React 19 + TypeScript + Tailwind CSS + Web Audio API synthesizer for folk motifs and SpeechSynthesis for native greetings.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Persistence Layer</h3>
              <p className="text-xs text-slate-400 mt-1">
                PostgreSQL 15+ (with Prisma ORM) for ACID transactions on Virtual Passports, user ratings, stamps, and match audits.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Real-Time Sync</h3>
              <p className="text-xs text-slate-400 mt-1">
                Full-duplex WebSocket communication with room multiplexing, anti-cheat server timestamps, and heartbeat ping/pong.
              </p>
            </div>
          </div>

          {/* Architecture Architectural Diagram Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Full-Stack Component Topology Diagram</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
              <pre className="text-[11px] sm:text-xs">
{`+-----------------------------------------------------------------------------------+
|                            CLIENT TIER (React + TypeScript)                      |
|  - GameArena (1v1 Duels)    - VirtualPassport (Stamps & Badges)  - WorldMap SVG   |
|  - Web Audio Synthesizer    - Socket.io Client                   - Leaderboard    |
+------------------------------------------+----------------------------------------+
                                           |
                    HTTPS (REST)           | WebSocket (Full-Duplex TCP)
                 (Auth, User Profile)      | (Matchmaking, Round Sync, Live Clock)
                                           |
+------------------------------------------v----------------------------------------+
|                   APPLICATION & GAME SERVER (Node.js / Express)                  |
|  +---------------------------+  +------------------------+  +-------------------+ |
|  | Matchmaking Queue Engine  |  | Authoritative Game Loop|  | Passport Service  | |
|  | (FIFO / ELO Matchmaker)   |  | (Timer, Answer Verify) |  | (Stamp Minting)   | |
|  +---------------------------+  +------------------------+  +-------------------+ |
+------------------------------------------+----------------------------------------+
                                           |
                                Prisma ORM / SQL Pool
                                           |
+------------------------------------------v----------------------------------------+
|                       DATABASE TIER (PostgreSQL 15+ ACID)                         |
|  - users        - passports       - passport_stamps   - matches   - questions     |
+-----------------------------------------------------------------------------------+`}
              </pre>
            </div>
          </div>

          {/* Academic Criteria Checklist for Terminale NSI */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Terminale NSI / Computer Science Grading Rubric Alignment</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Key syllabus competencies addressed in this project:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="font-bold text-cyan-400 block mb-1">1. Relational Database Modeling (3NF)</span>
                <p className="text-slate-300">
                  Strict entity normalization, foreign key constraints (`ON DELETE CASCADE`), primary key indexes, and check constraints (`CHECK (xp &gt;= 0)`).
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="font-bold text-emerald-400 block mb-1">2. Network Protocols & Concurrency</span>
                <p className="text-slate-300">
                  Full-duplex WebSocket RFC 6455 transport, JSON packet framing, race condition prevention, and non-blocking asynchronous event loops.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="font-bold text-purple-400 block mb-1">3. Algorithmic State Machines</span>
                <p className="text-slate-300">
                  Authoritative game loop state machine (`searching` ➔ `matched` ➔ `playing_round` ➔ `round_review` ➔ `match_finished`) with millisecond time resolution.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="font-bold text-amber-400 block mb-1">4. Human-Computer Interaction (HCI)</span>
                <p className="text-slate-300">
                  Accessible SVG map interactions, responsive layouts, procedural Web Audio generation, and sensory feedback (confetti, ink stamping sound, timer alerts).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: RELATIONAL SCHEMA & ERD ================= */}
      {activeSubTab === 'schema' && (
        <div className="space-y-6">
          {/* Interactive ERD Diagram Visualizer */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>Interactive Entity-Relationship Diagram (ERD)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Complete relational model showing cardinality (1:1, 1:N, N:M) and primary/foreign key connections.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {/* TABLE 1: USERS */}
              <div className="rounded-2xl bg-slate-950 border-2 border-blue-500/40 p-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-500/30">
                  <span className="font-black text-blue-400">TABLE: users</span>
                  <span className="text-[10px] text-blue-300 bg-blue-950 px-1.5 py-0.5 rounded">Core Entity</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="text-amber-300 font-bold">PK  id: UUID</li>
                  <li>username: VARCHAR(50) [UNIQUE]</li>
                  <li>email: VARCHAR(255) [UNIQUE]</li>
                  <li>password_hash: VARCHAR(255)</li>
                  <li>country_code: CHAR(2)</li>
                  <li>country_name: VARCHAR(100)</li>
                  <li>xp: INTEGER</li>
                  <li>level: INTEGER</li>
                  <li>rank_title: VARCHAR(100)</li>
                </ul>
              </div>

              {/* TABLE 2: PASSPORTS */}
              <div className="rounded-2xl bg-slate-950 border-2 border-amber-500/40 p-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/30">
                  <span className="font-black text-amber-400">TABLE: passports</span>
                  <span className="text-[10px] text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded">1 : 1 to User</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="text-amber-300 font-bold">PK  id: UUID</li>
                  <li className="text-cyan-400 font-bold">FK  user_id: UUID ➔ users.id</li>
                  <li>passport_number: VARCHAR(30) [UNIQUE]</li>
                  <li>issue_date: DATE</li>
                  <li>total_stamps_count: INTEGER</li>
                </ul>
              </div>

              {/* TABLE 3: PASSPORT STAMPS */}
              <div className="rounded-2xl bg-slate-950 border-2 border-rose-500/40 p-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-500/30">
                  <span className="font-black text-rose-400">TABLE: passport_stamps</span>
                  <span className="text-[10px] text-rose-300 bg-rose-950 px-1.5 py-0.5 rounded">1 : N to Passport</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="text-amber-300 font-bold">PK  id: UUID</li>
                  <li className="text-cyan-400 font-bold">FK  passport_id: UUID ➔ passports.id</li>
                  <li>country_code: CHAR(2)</li>
                  <li>country_name: VARCHAR(100)</li>
                  <li>capital: VARCHAR(100)</li>
                  <li>ink_color: VARCHAR(20)</li>
                  <li>unlocked_reason: ENUM</li>
                  <li>opponent_username: VARCHAR(50)</li>
                  <li>coordinates: VARCHAR(50)</li>
                </ul>
              </div>

              {/* TABLE 4: MATCHES */}
              <div className="rounded-2xl bg-slate-950 border-2 border-purple-500/40 p-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-500/30">
                  <span className="font-black text-purple-400">TABLE: matches</span>
                  <span className="text-[10px] text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded">Duel Session</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="text-amber-300 font-bold">PK  id: UUID</li>
                  <li className="text-cyan-400 font-bold">FK  player1_id: UUID ➔ users.id</li>
                  <li className="text-cyan-400 font-bold">FK  player2_id: UUID ➔ users.id</li>
                  <li className="text-cyan-400 font-bold">FK  winner_id: UUID ➔ users.id</li>
                  <li>is_draw: BOOLEAN</li>
                  <li>player1_score: INTEGER</li>
                  <li>player2_score: INTEGER</li>
                  <li>status: ENUM</li>
                  <li>started_at: TIMESTAMP</li>
                </ul>
              </div>

              {/* TABLE 5: MATCH ROUNDS */}
              <div className="rounded-2xl bg-slate-950 border-2 border-emerald-500/40 p-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-500/30">
                  <span className="font-black text-emerald-400">TABLE: match_rounds</span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded">Round History</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="text-amber-300 font-bold">PK  id: UUID</li>
                  <li className="text-cyan-400 font-bold">FK  match_id: UUID ➔ matches.id</li>
                  <li className="text-cyan-400 font-bold">FK  question_id: UUID ➔ questions.id</li>
                  <li>round_number: INTEGER</li>
                  <li>p1_selected_option: TEXT</li>
                  <li>p1_time_ms: INTEGER</li>
                  <li>p1_is_correct: BOOLEAN</li>
                  <li>p2_selected_option: TEXT</li>
                  <li>p2_time_ms: INTEGER</li>
                  <li>p2_is_correct: BOOLEAN</li>
                </ul>
              </div>

              {/* TABLE 6: QUESTIONS */}
              <div className="rounded-2xl bg-slate-950 border-2 border-cyan-500/40 p-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/30">
                  <span className="font-black text-cyan-400">TABLE: questions</span>
                  <span className="text-[10px] text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded">Question Bank</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="text-amber-300 font-bold">PK  id: UUID</li>
                  <li>type: ENUM (5 mini-games)</li>
                  <li>country_code: CHAR(2)</li>
                  <li>prompt: TEXT</li>
                  <li>options: JSONB (array)</li>
                  <li>correct_answer: TEXT</li>
                  <li>explanation: TEXT</li>
                  <li>cultural_fact: TEXT</li>
                  <li>sound_metadata: JSONB</li>
                  <li>map_coordinates: JSONB</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: REAL-TIME LOGIC & FLOW ================= */}
      {activeSubTab === 'realtime' && (
        <div className="space-y-6">
          {/* Chronological Sequence Diagram */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-400" />
              <span>Real-Time WebSocket Protocol Sequence Diagram</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Step-by-step authoritative event flow from matchmaking queue to passport stamp persistence.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
              <pre className="text-[11px] sm:text-xs">
{`CLIENT 1 (Tunisia 🇹🇳)               SERVER (Node/Socket.io)             CLIENT 2 (Japan 🇯🇵)
       |                                      |                                      |
       |----- 1. JOIN_MATCHMAKING ----------->|                                      |
       |                                      |<----- 2. JOIN_MATCHMAKING -----------|
       |                                      |                                      |
       |                               [Matchmaker Pairs Peers]                      |
       |                               [Creates room_12345]                          |
       |                                      |                                      |
       |<---- 3. MATCH_FOUND -----------------|------------------ 3. MATCH_FOUND --->|
       |      {opponent: "Kenji", JP}         |       {opponent: "Youssef", TN}      |
       |                                      |                                      |
       |                               [Prepares 5 Rounds]                           |
       |                                      |                                      |
       |<---- 4. ROUND_START (Round 1) -------|----------- 4. ROUND_START (Round 1)->|
       |      {prompt, timeLimit: 12s}        |       {prompt, timeLimit: 12s}       |
       |                                      |                                      |
       |-- 5. SUBMIT_ANSWER (1.8s) ---------->|                                      |
       |                               [Calculates pts]                              |
       |                                      |--- 6. OPPONENT_ANSWERED (1.8s) ------>|
       |                                      |                                      |
       |                                      |<-- 7. SUBMIT_ANSWER (3.1s) ----------|
       |                               [Calculates pts]                              |
       |<--- 8. OPPONENT_ANSWERED (3.1s) -----|                                      |
       |                                      |                                      |
       |                             [Both Answered -> Resolve!]                     |
       |<--- 9. ROUND_RESOLVED ---------------|------------- 9. ROUND_RESOLVED ----->|
       |     {correctAnswer, scores}          |      {correctAnswer, scores}         |
       |                                      |                                      |
       |                          [Repeats for Rounds 2-5]                           |
       |                                      |                                      |
       |<--- 10. MATCH_COMPLETED -------------|----------- 10. MATCH_COMPLETED ----->|
       |     {winner, stamp: "JP"}            |      {stamp: "TN"}                   |
       |                                      |                                      |
       | [Stamps Virtual Passport]            | [Stamps Virtual Passport]            |
       v                                      v                                      v`}
              </pre>
            </div>
          </div>

          {/* Live Packet Telemetry Inspector */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>Live WebSocket Frame Inspector (Telemetry)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Packets emitted and received during active gameplay in the Arena.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                STREAMING
              </span>
            </div>

            {livePackets.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500 font-mono">
                No network packets recorded yet. Play a 1v1 duel in the Arena to inspect live traffic!
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 font-mono text-xs">
                {livePackets.map((pkt) => (
                  <div
                    key={pkt.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                          pkt.direction === 'client_to_server'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}
                      >
                        {pkt.direction === 'client_to_server' ? 'TX ➔' : 'RX ⬅'}
                      </span>
                      <span className="font-bold text-white">{pkt.event}</span>
                    </div>

                    <div className="text-slate-400 text-[11px] truncate max-w-sm sm:max-w-md">
                      {JSON.stringify(pkt.payload)}
                    </div>

                    <span className="text-[10px] text-slate-500 shrink-0">{pkt.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SECTION 4: STARTER CODE IMPLEMENTATIONS ================= */}
      {activeSubTab === 'starter_code' && (
        <div className="space-y-6">
          {/* Starter 1: SQL Schema */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold text-white">schema.sql (PostgreSQL 3NF DDL)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(sqlDdlCode, 'sql')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 cursor-pointer transition-colors"
              >
                {copiedSection === 'sql' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950/70 overflow-x-auto max-h-80 leading-relaxed">
              {sqlDdlCode}
            </pre>
          </div>

          {/* Starter 2: Prisma Schema */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-xs font-bold text-white">schema.prisma (Modern ORM Definition)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(prismaSchemaCode, 'prisma')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 cursor-pointer transition-colors"
              >
                {copiedSection === 'prisma' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prisma</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950/70 overflow-x-auto max-h-80 leading-relaxed">
              {prismaSchemaCode}
            </pre>
          </div>

          {/* Starter 3: Socket.io Server */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold text-white">server.js (Node.js + Socket.io Server-Authoritative Loop)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(socketServerCode, 'socket')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 cursor-pointer transition-colors"
              >
                {copiedSection === 'socket' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Server Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950/70 overflow-x-auto max-h-80 leading-relaxed">
              {socketServerCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
