import { updateAsset } from "../reducers/assetData";
import { mapService } from "../services/mapService";
import { store } from "../store/store";

let ws;
let wsUri = "ws:";
let loc = window.location;
if (loc.protocol === "https:") { wsUri = "wss:"; }

wsUri += "//suas207-vm.su.ro.conti.de:35859/" + "ws/booking2";

export const wsConnect = () => {
    ws = new WebSocket(wsUri);

    ws.onmessage = function (msg) {
        console.log(JSON.parse(msg.data))
        let data = JSON.parse(msg.data)
        let state = data.state;
        let mapData = data.mapData;
        const previousState = store.getState().assetsData["Stand-Up Desk"];

        // Message example
        // {
        //     "topic": "updateAsset",
        //     "type": "Stand-Up Desk",
        //     "assetId": 435,
        //     "props": {
        //         "Reserved": true,
        //     }
        // }

        // Desk Booking

        switch (data.topic) {
            case "updateAsset":
                store.dispatch(updateAsset(data));
                break;
        
            default:
                break;
        }

        // Compare states 
        console.log(state, mapData)

        // let diff = [];

        // previousState.forEach(val => {
        //     const found = mapData["Stand-Up Desk"].find(el => el["assetId"] == val["assetId"] && el["Reserved"] !== val["Reserved"]);

        //     if(found){
        //         diff.push({prev: val, current: found})
        //     }
        // })

        // console.log(diff);

        // store.dispatch(updateAsset({ ...state }));

        //  === Update Asset on the map ===

        // Get the modified state

        // let newAssetData = {
        //     ...mapData
        // }

        // // Format state for mapService

        // let updatedState = [];

        // for (let i in newAssetData) {
        //     newAssetData[i].forEach( s => {
        //         updatedState.push(s)
        //     })
        // }
        // console.log(updatedState)

        // Update Assets
        mapService.updateAssetData(data);


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