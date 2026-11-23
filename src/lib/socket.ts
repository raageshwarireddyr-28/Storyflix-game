export function createRoomSocket(): WebSocket {
  if (typeof window === 'undefined') throw new Error('Room sockets require a browser.');
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return new WebSocket(`${protocol}//${window.location.host}/ws`);
}
