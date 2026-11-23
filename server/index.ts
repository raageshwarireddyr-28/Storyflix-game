import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { generate } from './ai.js';

type Player = { id: string; name: string; ready: boolean };
type Room = { code: string; hostId: string; players: Map<string, Player>; phase: 'lobby' | 'playing' | 'ended'; createdAt: number; sockets: Set<WebSocket> };
const rooms = new Map<string, Room>();
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const code = () => Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
const broadcast = (room: Room, event: unknown) => room.sockets.forEach((socket) => socket.readyState === WebSocket.OPEN && socket.send(JSON.stringify(event)));
const publicRoom = (room: Room) => ({ code: room.code, hostId: room.hostId, phase: room.phase, players: [...room.players.values()] });

const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => res.status(200).json({ ok: true, service: 'storyflix' }));
app.get('/api/health', (_req, res) => res.status(200).json({ ok: true, service: 'storyflix' }));
app.post('/api/ai/:task', async (req, res) => {
  const task = String(req.params.task);
  if (!['opening', 'help', 'twist', 'suggest'].includes(task)) return res.status(400).json({ error: 'Unsupported AI task.' });
  const result = await generate(task, req.body ?? {});
  return res.json({ result, fallback: !process.env.ANTHROPIC_API_KEY });
});
app.post('/api/rooms', (req, res) => {
  let roomCode = code();
  while (rooms.has(roomCode)) roomCode = code();
  const hostId = String(req.body?.playerId ?? randomUUID());
  const player: Player = { id: hostId, name: String(req.body?.name ?? 'Host').slice(0, 30), ready: true };
  const room: Room = { code: roomCode, hostId, players: new Map([[hostId, player]]), phase: 'lobby', createdAt: Date.now(), sockets: new Set() };
  rooms.set(roomCode, room);
  res.status(201).json({ room: publicRoom(room), playerId: hostId });
});
app.get('/api/rooms/:roomCode', (req, res) => {
  const room = rooms.get(req.params.roomCode.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });
  return res.json({ room: publicRoom(room) });
});

const serverDirectory = dirname(fileURLToPath(import.meta.url));
const clientDirectory = join(serverDirectory, '../dist');
app.use(express.static(clientDirectory));
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  return res.sendFile(join(clientDirectory, 'index.html'));
});

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (socket) => {
  let room: Room | undefined;
  let playerId = '';
  socket.on('message', (raw) => {
    let message: { type: string; roomCode?: string; playerId?: string; name?: string; ready?: boolean };
    try { message = JSON.parse(String(raw)) as typeof message; } catch { socket.send(JSON.stringify({ type: 'error', message: 'Invalid message.' })); return; }
    if (message.type === 'join') {
      room = rooms.get(message.roomCode?.toUpperCase() ?? '');
      playerId = String(message.playerId ?? randomUUID());
      if (!room) { socket.send(JSON.stringify({ type: 'error', message: 'Room not found.' })); return; }
      if (room.phase !== 'lobby') { socket.send(JSON.stringify({ type: 'error', message: 'This room has already started.' })); return; }
      const name = String(message.name ?? 'Player').trim().slice(0, 30);
      if (!name || [...room.players.values()].some((player) => player.name.toLowerCase() === name.toLowerCase() && player.id !== playerId)) { socket.send(JSON.stringify({ type: 'error', message: 'Choose a unique display name.' })); return; }
      room.players.set(playerId, { id: playerId, name, ready: false }); room.sockets.add(socket);
      broadcast(room, { type: 'room', room: publicRoom(room) }); return;
    }
    if (!room || !playerId) return;
    if (message.type === 'ready') { const player = room.players.get(playerId); if (player) player.ready = Boolean(message.ready); broadcast(room, { type: 'room', room: publicRoom(room) }); }
    if (message.type === 'start' && room.hostId === playerId && room.players.size > 1) { room.phase = 'playing'; broadcast(room, { type: 'room', room: publicRoom(room) }); }
  });
  socket.on('close', () => { if (!room) return; room.sockets.delete(socket); });
});
setInterval(() => { const expiry = Date.now() - 30 * 60 * 1000; rooms.forEach((room, key) => { if (room.sockets.size === 0 && room.createdAt < expiry) rooms.delete(key); }); }, 60_000).unref();
const port = Number(process.env.PORT ?? 3000);
server.listen(port, '0.0.0.0', () => console.log(`StoryFlix server listening on http://0.0.0.0:${port}`));
