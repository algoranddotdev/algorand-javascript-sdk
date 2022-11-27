import {SocketController} from './SocketController.js';

describe('SocketController', () => {
  test('Open and close', async () => {
    // Mock WebSocket to trigger the desired callbacks.
    const mockEvents = async (socket) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      socket.onopen();
    };
    class MockWebSocket {
      constructor() {
        mockEvents(this);
      }
    }
    global.WebSocket = MockWebSocket;

    const socket = new SocketController('http://localhost:1234');
    await socket.hyndrate();

    await expect(socket.isOpen).resolves.toBe(true);

    socket.didClose();

    await expect(socket.isOpen).resolves.toBe(false);
  });
});