import {ref, UnwrapRef} from "vue";
import {SocketIOClient} from "./socketio.service";


export class FunctionScriptHelper {
    constructor(private socket: SocketIOClient) {
    }

    async invoke(alias: string, context: any) {
        console.log('invoking function ', alias, this.socket)
        let value = await this.socket.emit('functions/call', {
            alias: alias,
            context: context
        })
        console.log(value)
        return value
    }
}

let funcScriptHelper = ref<FunctionScriptHelper>(null)

export function useFunctionScriptHelper(socket): UnwrapRef<any> {
    if (!funcScriptHelper.value)
        funcScriptHelper.value = new FunctionScriptHelper(socket)

    return funcScriptHelper.value
}