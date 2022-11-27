class SocketController {
  constructor(serverUrl) {
    this.serverUrl = new URL(serverUrl);
    this.socket = null;
    this.wasClosed = false;

    this.onMessage = null;
    this.onOpen = null;

    // Computed properties.
    this.socketUrl = new URL(this.serverUrl);
    console.log(this.socketUrl);
    // this.socketUrl.protocol = this.socketUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    this.socketUrl.search = (
      `?env=browser` +
      `&host=${encodeURIComponent(window.location.host)}` +
      `&protocol=wc` +
      `&version=1`
    );
  }
  open() {
    this.resolveOpened = null;
    this.isOpen = new Promise((resolve) => this.resolveOpened = resolve);

    this.socket = new WebSocket(this.socketUrl);

    this.socket.onopen = this.didOpen.bind(this);
    this.socket.onmessage = this.didReceive.bind(this);
    this.socket.onerror = this.didErr.bind(this);
    this.socket.onclose = this.didClose.bind(this);
  }
  close() {
    console.log('close');
    if (this.socket) {
      this.wasClosed = true;
      this.socket.close();
    }
  }
  send(payload) {
    this.socket.send(
      JSON.stringify(payload)
    );
  }

  didReceive(event) {
    if (typeof this.onMessage === 'function') {
      this.onMessage(JSON.parse(event.data));
    }
  }
  didOpen(event) {
    console.log('didOpen');
    if (typeof this.onOpen === 'function') {
      this.onOpen();
    }
    this.resolveOpened(true);
  }
  didErr(event) {
    this.isOpen = Promise.resolve(false);
  }
  didClose(event) {
    console.log('didClose', !this.wasClosed);
    if (!this.wasClosed) {
      this.isOpen = Promise.resolve(false);
      this.socket = null;
  
      this.open();
    }
    

    // if (typeof this.onClose === 'function') {
    //   this.onClose();
    // }
  }
}

export {SocketController};