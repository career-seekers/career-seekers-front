import Stomp from 'webstomp-client';

type ClientId = string;

class SocketService {
  clients: Record<ClientId, ReturnType<typeof Stomp.over>> = {};
  connections: Record<ClientId, boolean> = {};

  connect(id: ClientId, url: string, headers: Record<string, string>, onConnect: () => void, onError: () => void) {
    if (this.clients[id] && this.connections[id]) return;

    const socket = new WebSocket(url);
    const stompClient = Stomp.over(socket);
    this.clients[id] = stompClient;
    stompClient.connect(headers, () => {
      this.connections[id] = true;
      onConnect();
    }, () => {
      this.connections[id] = false;
      onError();
    });
  }

  subscribe(id: ClientId, destination: string, callback: (msg: any) => void) {
    if (this.clients[id] && this.connections[id]) {
      this.clients[id].subscribe(destination, callback);
    }
  }

  send(id: ClientId, destination: string, body: any) {
    if (this.clients[id] && this.connections[id]) {
      this.clients[id].send(destination, JSON.stringify(body), {});
    }
  }

  disconnect(id: ClientId) {
    if (this.clients[id] && this.connections[id]) {
      this.clients[id].disconnect(() => {
        this.connections[id] = false;
      });
    }
  }
}

export const socketService = new SocketService();