import SockJS from "sockjs-client";
import {Client} from "@stomp/stompjs";
import apiConf from "@/api/api.conf";

class SocketManager {
    public async connect() {
        const socket = new SockJS(apiConf.socketEndpoint)
        return new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(str),
            reconnectDelay: 5000,
        })
    }

    public async disconnect(stompClient: Client) {
        await stompClient?.deactivate()
    }
}

export default SocketManager;