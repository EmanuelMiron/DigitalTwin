import { updateAsset } from "../reducers/assetData";
import { mapService } from "../services/mapService";
import { store } from "../store/store";

let ws;
let wsUri = "ws:";
let loc = window.location;
if (loc.protocol === "https:") { wsUri = "wss:"; }

wsUri += "//suas207-vm.su.ro.conti.de:35859/" + "ws/booking";

export const wsConnect = () => {
    ws = new WebSocket(wsUri);

    ws.onmessage = function (msg) {
        console.log(JSON.parse(msg.data))
        let data = JSON.parse(msg.data)
        let state = data.state;
        let mapData = data.mapData;

        store.dispatch(updateAsset({ ...state }));

        //  === Update Asset on the map ===

        // Get the modified state

        let newAssetData = {
            ...mapData
        }

        // Format state for mapService

        let updatedState = [];

        for (let i in newAssetData) {
            newAssetData[i].forEach( s => {
                updatedState.push(s)
            })
        }

        // Update Assets
        mapService.updateAssetsData(updatedState);


        console.log('State Changed');
    }

    ws.onopen = function () {
        //ws.send("Open for data");
        console.log("connected");
    }
    ws.onclose = function () {
        // in case of lost connection tries to reconnect every 3 secs
        setTimeout(wsConnect, 3000);
    }
}

export const sendWebSocketMessage = (m) => {
    if (ws) { ws.send(m); }
}