# Wallet Connect

URI is the deeplink to open the wallet app as well as generate a QR code to be scanned by the app to establish a connection.

The WalletConnect client generates an URI and I need to find out how. First hint is in the `clients/core/src/index.ts`.

```JavaScript
private _formatUri() {
  const protocol = this.protocol;
  const handshakeTopic = this.handshakeTopic;
  const version = this.version;
  const bridge = encodeURIComponent(this.bridge);
  const key = this.key;
  const uri = `${protocol}:${handshakeTopic}@${version}?bridge=${bridge}&key=${key}`;
  return uri;
}
```

```JavaScript
const protocol = 'wc';
const version = 1;
const handshakeTopic = uuid();
```

They use a custom `uuid()` function but I just can't see a reason why?

```JavaScript
function uuid() {
  const result = ((a, b) => {
    for (
      b = a = "";
      a++ < 36;
      b += (a * 51) & 52 ? (a ^ 15 ? 8 ^ (Math.random() * (a ^ 20 ? 16 : 4)) : 4).toString(16) : "-"
    ) {
      // empty
    }
    return b;
  })();
  return result;
}
```

```JavaScript
  set key(value: string) {
    if (!value) {
      return;
    }
    const key: ArrayBuffer = convertHexToArrayBuffer(value);
    this._key = key;
  }

  get key(): string {
    if (this._key) {
      const key: string = convertArrayBufferToHex(this._key, true);
      return key;
    }
    return "";
  }

  private async _generateKey(): Promise<ArrayBuffer | null> {
    if (this._cryptoLib) {
      const result = await this._cryptoLib.generateKey();
      return result;
    }
    return null;
  }
```

From `helpers/iso-crypto/src/index.ts`.

```JavaScript
export async function generateKey(length?: number): Promise<ArrayBuffer> {
  const _length = (length || 256) / 8;
  const bytes = crypto.randomBytes(_length);
  const result = convertBufferToArrayBuffer(encoding.arrayToBuffer(bytes));

  return result;
}
```

```JavaScript
export function getBrowerCrypto(): Crypto {
  // @ts-ignore
  return global?.crypto || global?.msCrypto || {};
}
export function randomBytes(length: number): Uint8Array {
  const browserCrypto = env.getBrowerCrypto();
  return browserCrypto.getRandomValues(new Uint8Array(length));
}
```

```
wc:430372b1-1e1c-4750-9200-4fe9e8e94b2d@1?bridge=https%3A%2F%2Fwallet-connect-a.perawallet.app&key=91482f61ca5efa79741d6f12b3ca0947860f7114b84359addc73b32f40d65940
wc:9382b124-23a4-412a-addb-49daba395c15@1?bridge=https%3A%2F%2Fwallet-connect-a.perawallet.app&key=2182cb7dca9b3de5c5f62204ca224a55517f63a711d940ace2ef556f5c30ee80

wc:{topic...}@{version...}?bridge={url...}&key={key...}

topic = 430372b1-1e1c-4750-9200-4fe9e8e94b2d
version = 1
bridge = https%3A%2F%2Fwallet-connect-a.perawallet.app
key = 91482f61ca5efa79741d6f12b3ca0947860f7114b84359addc73b32f40d65940
```

{
  "topic":"492ef2a9-4cb3-49e8-9453-36c37beb6d22",
  "type":"pub",
  "payload":"{
    "data":"103a24b93765dd0a7b89b80526a975e7679cd6b1a0bc81199a2fef9591262222830f4bb4c2a1c7a660347b23f9b4fb0b7398ac0d864d233db22d6849f9a15c3d00c832c1a6280c86969cae41ab961159d3b6196a0a9c0f33e0a2f787089ec5706a60a1d9173129f2065f47a814071ad92b0e05934c6c7a24d6285c5f4ba89d009632ecea987f252c35b27870942b75ae5cb5953937f8dbcec7f953a51b17f6ceb43b86de4a85da6cf46c20db40e64247ff034b6999edb44787818985b2913c07fb9b47a28a121ff9e74156eb31e34c82d26eb1af8b37885899de3d288a9481699504d9a6445ff1cf9ebbf8adb0d6c9786a0b77ee62ab736e59e6758042d3b02647cb1370e3eef6fb9058432e7988c572ffaac4174fb4f99bcf9faf0b7b06a8ccd540edb568e0af82cc744bff205150aef6d0fc754aa16ac6820f307d70d6e457",
    "hmac":"ad9d260dc46ce9817f5dbdcfe2ea4fcba7a00ab0ced82dd3e094a7d348b1fef8",
    "iv":"a9c46c5fa73bb5e4cadfc4d5de535da0"
    }",
  "silent":true
}

{"topic":"8d65e0ce-864a-48c7-b7de-a0c9fbc85ce9","type":"sub","payload":"","silent":true}

{"topic":"d18a5745-7518-4f82-a83c-6bf1830d99aa","type":"pub","payload":"{\"data\":\"0cdaa05cd89c154d6271fff498ed72fa649335e09d93593f36923e6cb30ffe26ac81f49348f689ddadffa6b9639149519c1fdafe671f5c4a4dddcc2bf4aa554499348d8070a925cbe3d633598d732a6b9757c335a9eddac44c587843077ac506986b2b3af6ece4497283d5bb4eb88be73a92ef72c9d7a8123086078b1cb9a29611c1fd7845fee2199663960c6261512a987db93e555a09c3f166501d0999bffd4a163209dfcdda0debe0b873bca4477a9218c16614d04ab776342f42f87ab4e4ad181a852eba7347405e57b1ef2b3250dc342a41ed5f1f86cb66edd46e9041271c36551b854664f6db6f7b5341d8338ca2552f275920f7073a736a2fee0de29f4a760686ed85b64d1a420a6a31f971dddba29ff29f38ed30add117010d33a0d71864518d56d64483204c341c13cd2d15b96bcaec0f2d9cf0b92100659be61801\",\"hmac\":\"e8259c5e5f69b6cc325b5e561dbe0cb5f2c8af8e1a68a75a8e78ae2ee62ee285\",\"iv\":\"3820a226a2a4a64f74a139391ec4810b\"}","silent":true}

Translates to

{
  "id": 1656941670875878,
  "jsonrpc": "2.0",
  "method": "wc_sessionRequest",
  "params": [
    {
      "peerId": "8d65e0ce-864a-48c7-b7de-a0c9fbc85ce9",
      "peerMeta": {
        "description": "Algorand developer hub for aspiring blockchain developers.",
        "url": "https://fa21-188-69-55-64.eu.ngrok.io",
        "icons": [],
        "name": "Algorand.dev"
      },
      "chainId": null
    }
  ]
}

wc:d18a5745-7518-4f82-a83c-6bf1830d99aa@1?bridge=https%3A%2F%2Fwallet-connect-a.perawallet.app&key=66a787d9d699118768e1131009a5d3852ca85da8e4eaec9c48f5840269e2fd92

```js
export async function decrypt(
  payload: IEncryptionPayload,
  key: ArrayBuffer,
): Promise<IJsonRpcRequest | IJsonRpcResponseSuccess | IJsonRpcResponseError | null> {
  const _key = encoding.bufferToArray(convertArrayBufferToBuffer(key));

  if (!_key) {
    throw new Error("Missing key: required for decryption");
  }

  const verified: boolean = await verifyHmac(payload, _key);
  if (!verified) {
    return null;
  }

  const cipherText = encoding.hexToArray(payload.data);
  const iv = encoding.hexToArray(payload.iv);
  const buffer = await crypto.aesCbcDecrypt(iv, _key, cipherText);
  const utf8: string = encoding.arrayToUtf8(buffer);
  let data: IJsonRpcRequest;
  try {
    data = JSON.parse(utf8);
  } catch (error) {
    return null;
  }

  return data;
}
export async function verifyHmac(payload: IEncryptionPayload, key: Uint8Array): Promise<boolean> {
  const cipherText = encoding.hexToArray(payload.data);
  const iv = encoding.hexToArray(payload.iv);
  const hmac = encoding.hexToArray(payload.hmac);
  const hmacHex: string = encoding.arrayToHex(hmac, false);
  const unsigned = encoding.concatArrays(cipherText, iv);
  const chmac = await crypto.hmacSha256Sign(key, unsigned);
  const chmacHex: string = encoding.arrayToHex(chmac, false);

  if (encoding.removeHexPrefix(hmacHex) === encoding.removeHexPrefix(chmacHex)) {
    return true;
  }

  return false;
}
```

```js
  public async createSession(opts?: ICreateSessionOptions): Promise<void> {
    if (this._connected) {
      throw new Error(ERROR_SESSION_CONNECTED);
    }

    if (this.pending) {
      return;
    }

    this._key = await this._generateKey();

    const request: IJsonRpcRequest = this._formatRequest({
      method: "wc_sessionRequest",
      params: [
        {
          peerId: this.clientId,
          peerMeta: this.clientMeta,
          chainId: opts && opts.chainId ? opts.chainId : null,
        },
      ],
    });

    this.handshakeId = request.id;
    this.handshakeTopic = uuid();

    this._sendSessionRequest(request, "Session update rejected", {
      topic: this.handshakeTopic,
    });

    this._eventManager.trigger({
      event: "display_uri",
      params: [this.uri],
    });
  }
  protected _formatRequest(request: Partial<IJsonRpcRequest>): IJsonRpcRequest {
    if (typeof request.method === "undefined") {
      throw new Error(ERROR_MISSING_METHOD);
    }
    const formattedRequest: IJsonRpcRequest = {
      id: typeof request.id === "undefined" ? payloadId() : request.id,
      jsonrpc: "2.0",
      method: request.method,
      params: typeof request.params === "undefined" ? [] : request.params,
    };
    return formattedRequest;
  }
  protected async _sendSessionRequest(
    request: IJsonRpcRequest,
    errorMsg: string,
    options?: IInternalRequestOptions,
  ) {
    this._sendRequest(request, options);
    this._subscribeToSessionResponse(request.id, errorMsg);
  }

  protected async _sendRequest(
    request: Partial<IJsonRpcRequest>,
    options?: Partial<IInternalRequestOptions>,
  ) {
    const callRequest: IJsonRpcRequest = this._formatRequest(request);

    const encryptionPayload: IEncryptionPayload | null = await this._encrypt(callRequest);

    const topic: string = typeof options?.topic !== "undefined" ? options.topic : this.peerId;
    const payload: string = JSON.stringify(encryptionPayload);
    const silent =
      typeof options?.forcePushNotification !== "undefined"
        ? !options.forcePushNotification
        : isSilentPayload(callRequest);

    this._transport.send(payload, topic, silent);
  }
  private _subscribeToSessionResponse(id: number, errorMsg: string) {
    this._subscribeToResponse(id, (error, payload) => {
      if (error) {
        this._handleSessionResponse(error.message);
        return;
      }
      if (isJsonRpcResponseSuccess(payload)) {
        this._handleSessionResponse(errorMsg, payload.result);
      } else if (payload.error && payload.error.message) {
        this._handleSessionResponse(payload.error.message);
      } else {
        this._handleSessionResponse(errorMsg);
      }
    });
  }

  private _handleSessionResponse(errorMsg: string, sessionParams?: ISessionParams) {
    if (sessionParams) {
      if (sessionParams.approved) {
        if (!this._connected) {
          this._connected = true;

          if (sessionParams.chainId) {
            this.chainId = sessionParams.chainId;
          }

          if (sessionParams.accounts) {
            this.accounts = sessionParams.accounts;
          }

          if (sessionParams.peerId && !this.peerId) {
            this.peerId = sessionParams.peerId;
          }

          if (sessionParams.peerMeta && !this.peerMeta) {
            this.peerMeta = sessionParams.peerMeta;
          }

          this._eventManager.trigger({
            event: "connect",
            params: [
              {
                peerId: this.peerId,
                peerMeta: this.peerMeta,
                chainId: this.chainId,
                accounts: this.accounts,
              },
            ],
          });
        } else {
          if (sessionParams.chainId) {
            this.chainId = sessionParams.chainId;
          }
          if (sessionParams.accounts) {
            this.accounts = sessionParams.accounts;
          }

          this._eventManager.trigger({
            event: "session_update",
            params: [
              {
                chainId: this.chainId,
                accounts: this.accounts,
              },
            ],
          });
        }

        this._manageStorageSession();
      } else {
        this._handleSessionDisconnect(errorMsg);
      }
    } else {
      this._handleSessionDisconnect(errorMsg);
    }
  }
```





Sockets

```javascript
  private _socketCreate() {
    if (this._nextSocket) {
      return;
    }

    const url = getWebSocketUrl(this._url, this._protocol, this._version);

    this._nextSocket = new WS(url);

    if (!this._nextSocket) {
      throw new Error("Failed to create socket");
    }

    this._nextSocket.onmessage = (event: MessageEvent) => this._socketReceive(event);

    this._nextSocket.onopen = () => this._socketOpen();

    this._nextSocket.onerror = (event: Event) => this._socketError(event);

    this._nextSocket.onclose = () => {
      setTimeout(() => {
        this._nextSocket = null;
        this._socketCreate();
      }, 1000);
    };
  }
```

# Pera Wallet

There are two defined schemes for deep links on iOS.

```swift
    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
        guard let scheme = url.scheme else {
            return false
        }
        
        /// <todo>
        /// Schemes should be controlled from a single point.
        switch scheme {
        case "algorand":
            receive(deeplinkWithSource: .url(url))
            return true
        case "algorand-wc":
            receive(deeplinkWithSource: .walletConnectSessionRequest(url))
            return true
        default:
            return false
        }
    }

// ⌄

extension AppDelegate {
    private func createAppLaunchController() -> AppLaunchController {
        return ALGAppLaunchController(
            session: session,
            api: api,
            sharedDataController: sharedDataController,
            authChecker: ALGAppAuthChecker(session: session),
            uiHandler: self
        )
    }
}

// ⌄

    func receive(
        deeplinkWithSource src: DeeplinkSource
    ) {
        if UIApplication.shared.isActive {
            switch authChecker.status {
            case .ready: resumeOrSuspend(deeplinkWithSource: src)
            default: suspend(deeplinkWithSource: src)
            }
        } else {
            suspend(deeplinkWithSource: src)
        }
    }

// ⌄

private func resumeOrSuspend(
    deeplinkWithSource src: DeeplinkSource
) {
    let result: DeeplinkResult
    
    switch src {
    case .remoteNotification(let userInfo, let waitForUserConfirmation):
        result = determineUIStateIfPossible(
            forRemoteNotificationWithUserInfo: userInfo,
            waitForUserConfirmation: waitForUserConfirmation
        )
    case .url(let url):
        result = determineUIStateIfPossible(forURL: url)
    case .walletConnectSessionRequest(let url):
        result = determineUIStateIfPossible(forWalletConnectSessionRequest: url)
    case .walletConnectRequest(let draft):
        result = determineUIStateIfPossible(forWalletConnectRequest: draft)
    case .buyAlgo(let draft):
        result = determineUIStateIfPossible(forBuyAlgo: draft)
    }
    
    switch result {
    case .none:
        break
    case .success(let uiState):
        uiHandler.launchUI(uiState)
        completePendingDeeplink()
    case .failure:
        suspend(deeplinkWithSource: src)
    }
}

// ⌄

private func determineUIStateIfPossible(
    forWalletConnectSessionRequest request: URL
) -> DeeplinkResult {
    let parserResult = deeplinkParser.discover(walletConnectSessionRequest: request)
    
    switch parserResult {
    case .none: return nil
    case .success(let key): return .success(.walletConnectSessionRequest(key))
    case .failure(let error): return .failure(error)
    }
}

// ⌄

func discover(
    walletConnectSessionRequest: URL
) -> Swift.Result<String, Error>? {
    if !sharedDataController.isAvailable {
        return .failure(.waitingForAccountsToBeAvailable)
    }
    
    let urlComponents =
        URLComponents(url: walletConnectSessionRequest, resolvingAgainstBaseURL: true)
    let queryItems = urlComponents?.queryItems
    let maybeWalletConnectSessionKey = queryItems?.first(matching: (\.name, "uri"))?.value
    return maybeWalletConnectSessionKey
        .unwrap(where: \.isWalletConnectConnection)
        .unwrap({ .success($0) })
}
```

After it confirms that the deeplink has the `algorand-wc` scheme and contains a query parameter `uri` that starts with `wc:`, it will proceed to consume the deeplink and then `uiHandler.launchUI(uiState)` where `uiState` is the `uri` parameter.

```swift
protocol AppLaunchUIHandler: AnyObject {
    func launchUI(
        _ state: AppLaunchUIState
    )
}

enum AppLaunchUIState {
    case authorization /// pin
    case onboarding
    case main(
        completion: (() -> Void)? = nil
    )
    case mainAfterAuthorization(
        presented: UIViewController,
        completion: () -> Void
    )
    case remoteNotification(
        AlgorandNotification,
        DeepLinkParser.Screen? = nil
    )
    case deeplink(DeepLinkParser.Screen)
    case walletConnectSessionRequest(String)
}

extension AppDelegate {
    func launchUI(
        _ state: AppLaunchUIState
    ) {
        switch state {
        case .authorization:
            router.launchAuthorization()
        case .onboarding:
            router.launchOnboarding()
        case .main(let completion):
            router.launchMain(completion: completion)
        case .mainAfterAuthorization(let presentedViewController, let completion):
            router.launcMainAfterAuthorization(
                presented: presentedViewController,
                completion: completion
            )
        case .remoteNotification(let notification, let screen):
            guard let someScreen = screen else {
                pushNotificationController.present(notification: notification)
                return
            }
            
            pushNotificationController.present(notification: notification) {
                [unowned self] in
                self.router.launch(deeplink: someScreen)
            }
        case .deeplink(let screen):
            router.launch(deeplink: screen)
        case .walletConnectSessionRequest(let key):
            NotificationCenter.default.post(
                name: WalletConnector.didReceiveSessionRequestNotification,
                object: nil,
                userInfo: [
                    WalletConnector.sessionRequestUserInfoKey: key
                ]
            )
        }
    }
}

// sessionKey is still the uri

extension Router {
    private func observeNotifications() {
        observe(notification: WalletConnector.didReceiveSessionRequestNotification) {
            [weak self] notification in
            guard let self = self else { return }
            
            let userInfoKey = WalletConnector.sessionRequestUserInfoKey
            let maybeSessionKey = notification.userInfo?[userInfoKey] as? String

            guard let sessionKey = maybeSessionKey else {
                return
            }
            
            let walletConnector = self.appConfiguration.walletConnector
            
            walletConnector.delegate = self
            walletConnector.connect(to: sessionKey)
        }
    }
}

func connect(to session: String) {
      guard let url = WalletConnectURL(session) else {
          delegate?.walletConnector(self, didFailWith: .failedToCreateSession(qr: session))
          return
      }

      do {
          try walletConnectBridge.connect(to: url)
      } catch {
          delegate?.walletConnector(self, didFailWith: .failedToConnect(url: url))
      }
  }

class JSONRPCSerializer: RequestSerializer, ResponseSerializer {
    private let codec: Codec = AES_256_CBC_HMAC_SHA256_Codec()
    
    func serialize(_ response: Response, topic: String) throws -> String {
        let jsonText = try jsonrpc.json(from: response)
        let cipherText = try codec.encode(plainText: jsonText, key: response.url.key)
        let message = PubSubMessage(topic: topic, type: .pub, payload: cipherText)
        return try message.json()
    }

    func deserialize(_ text: String, url: WCURL) throws -> Response {
        let message = try PubSubMessage.message(from: text)
        let payloadText = try codec.decode(cipherText: message.payload, key: url.key)
        do {
            return try jsonrpc.response(from: payloadText, url: url)
        } catch {
            throw JSONRPCSerializerError.wrongIncommingDecodedTextFormat(payloadText)
        }
    }
}
```

Storage

```json
{
  "connected":true,
  "accounts":["CCGJ7X6IAB5X3FDS3SX2BC4UOAOOTLQTY5ZK42K5BXZPLMF6PD3AFQK7NU"],
  "chainId":4160,
  "bridge":"https://wallet-connect-a.perawallet.app",
  "key":"449ae8dbd44fd888212bead2ebbd52e1896c19d7afa4f4b243fb9dfdbc11b46f",
  "clientId":"0fbb2b94-a647-40ad-b5e1-a4027a8826cc",
  "clientMeta":{
    "description":"Algorand developer hub for aspiring blockchain developers.",
    "url":"https://fa21-188-69-55-64.eu.ngrok.io",
    "icons":[],
    "name":"Algorand.dev"
  },
  "peerId":"1A62233C-9241-46BB-B3CE-5C27EEEBEEE0",
  "peerMeta":{
    "description":"Pera Wallet: Simply the best Algorand wallet.",
    "icons":[
      "https://algorand-app.s3.amazonaws.com/app-icons/Pera-walletconnect-128.png",
      "https://algorand-app.s3.amazonaws.com/app-icons/Pera-walletconnect-192.png",
      "https://algorand-app.s3.amazonaws.com/app-icons/Pera-walletconnect-512.png"
    ],
    "name":"Pera Wallet",
    "url":"https://perawallet.app/"
  },
  "handshakeId":1657040416003951,
  "handshakeTopic":"171f271b-602a-4cc0-a4f2-d8d05d682eed"
}
```

pub to peerId

```
"{\"topic\":\"fd30cb95-adbb-444a-9d6f-f502b51ca0a2\",\"type\":\"sub\",\"payload\":\"\",\"silent\":true}"
"{\"topic\":\"1A62233C-9241-46BB-B3CE-5C27EEEBEEE0\",\"type\":\"pub\",\"payload\":\"{\\\"data\\\":\\\"1b477bb8f5df7a8d764ed155c6cb60ced892eb90ff3d21ea1c700ff72b572f4803c4d198af73d0601239961e92f97c11ada545fe7c84677020b1717fed2f356419cf44be7bfeabe5f88eec3e145611d2fc750ddb129161e7aac68c25b2a8ad2ba611fd683dc309669c639a710470a811398597dc92546bae079a20a27f73ec9ebddfabceea0311840d5561e32704d3f1be0afe92fab7529242c730a6f39f6c412af2a8359d8c138b97bbd034569d09b98eda0b5e51d9175fe5dd8f2d82b9fae0e2fa7cc7de6505f954283a1f303cf6057fb2ae2da66efa1b3f6fefb01f820c610fb8924713268a8ff4b2129e4937e7631a8ce1def26edf55e9c1e405351e0212486e530fafe3d0a04130a6a598e91cb3e68bdc0c48c5829d823abb09e83c831c1c8f1aa4ee9bc498bb0fd919c962ba12a781ccdacd3fee457ab8e9ebde29b31f10e4e2dbaf8eb8fd51c1013dce3d637b\\\",\\\"hmac\\\":\\\"c4affde9b2012094db3a8268aade6b2de02032cb0ef1855428532487d8f6956a\\\",\\\"iv\\\":\\\"0a256c8109703ae49b4aee9fe6f7791a\\\"}\",\"silent\":true}"
```

```
{"silent":false,"topic":"3b06c0f2-0d0d-4d23-bbf5-e03358a5d342","payload":"{\"data\":\"f5cb5b608d1ff769d22c58dbfc46eeb476ca415d6cdd7907e22391e8be12260abdef3d42a23d1c1aef2aa7b1b6f91f75072d2900e7e2397e95d552baf0a414ab8c24d1b282c76a7eaf3c1193dbe23d99bdec3c71f800618d0f853da7e91a2668af35ad14f7a024ce1f04d668654148ffb15e592529c8b5122e9754fe26520dc7d4dba3f577485db5a0e1be359b3981b1d72d9303ffe43e7feb35b6abfac523e04d31b61f969bd7c15ba36ffa72f44d52018be10b409ea2e0ab3790fdb3f4ed3fdba331f9c6a3ff3d2d7a7ba521e6de322003a61218c1f71c6f17abc35cdd9afd34b631cb82dd0044a4f5d213dbc57a4cddfe96b91a58881b91562c6de381ae9cc70ed7d0c44a0536b2a199c4c5d383758851813aa0e8517f0807c8ee4d4f64a07c3b8a1798bb6add68655b8fe00c8d3b5c1ba8cd54bce1918e0c254fc7d5d7936899ac4121c86c379be709723a32b086e656a5d6099d4a43d146cc029b1da1215594cffd69246b0c917c80d80b5e07da3faad663cc67c3561966b8eac5c028542f7c39bdc964246f07b8cee7f545903d2ee92ce568490186bb33a6a94b7449bdc49ed91b8ecb85024951dfcae7286c80638a7580f5768cc357f03c9462904779b7870f1f3f108d702cc673a707d606a6ae9943bfad518b8e3fbf2db2696d522ba81be49fdbbe6db349158d7539ceb7636383b8f849686fe3b9155a9dbb53d0a115d80fcc79b24d55d5b2452f6dd59f656a0ae152d069e9f9140353f469cbbe7c6c0a1f0a3c21af4ee1e38f50116d39b1c97941d98aac460263efe7f9982cf1ca411582d8c0ea935da0c119405fccb179\",\"hmac\":\"763265815fb5480e219daeb8cf421f52be0586efbb3bb0bc246a4aee42c57642\",\"iv\":\"29472d89800f1e3241c44259c6885290\"}","type":"pub"}	1657469384.800006
```

```
ngrok http -region eu 3000
npm run development
npx jest --watch
```