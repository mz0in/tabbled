import {DataSourceConfigInterface, PageConfigDataSource} from "../../model/datasource";
import { PageConfigInterface } from "../../model/page";
import { MenuConfigInterface } from "../../model/menu";
import { Commit } from "vuex";
import { ref } from 'vue'
import { useSocket } from '../../services/socketio.service'
import { useDataSourceService } from '../../services/datasource.service'

let socket  = useSocket()
let dataSources = useDataSourceService();

let pagesDataSource = ref<PageConfigDataSource>(new PageConfigDataSource())


export interface ConfigInterface {
    dataSources: DataSourceConfigInterface[],
    pages: PageConfigInterface[],
    sidebarMenu: MenuConfigInterface[]
}

export interface ConfigStateInterface extends ConfigInterface {
    isLoaded: boolean
}

export interface ConfigResponseInterface {
    config: ConfigInterface,
    success: boolean
    error_message? : string
}


const state = (): ConfigStateInterface => ({
    dataSources: Array<DataSourceConfigInterface>(),
    pages: Array<PageConfigInterface>(),
    sidebarMenu: Array<MenuConfigInterface>(),
    isLoaded: false
})

const getters = {
    dataSources: (state: ConfigStateInterface) => {
        return state.dataSources
    },
    sidebarMenu: (state: ConfigStateInterface) => {
        return state.sidebarMenu
    },
    pages: (state: ConfigStateInterface) => {
        return state.pages
    },
    isLoaded: (state: ConfigStateInterface) => {
        return state.isLoaded
    },
}

const actions = {
    load( { commit }: { commit: Commit } ) {
        commit('unloaded')
        return new Promise((resolve, reject) => {
            socket.timeout(5000).emit("getConfiguration", {},
                (err: any, res: ConfigResponseInterface) => {
                if (!err && res && res.success) {
                    commit('loaded', res.config)
                    resolve(res)
                } else
                    reject((err && err.error_message) || 'Error loading configuration')
            })
        });
    }
}

const mutations = {
    loaded (state: ConfigStateInterface, config: ConfigInterface) {
        dataSources.clear()

        state.dataSources = config.dataSources;
        state.dataSources.forEach(ds => {
            dataSources.registerDataSource(ds)
        })

        state.pages = config.pages;
        dataSources.addDataSource(pagesDataSource.value)
        pagesDataSource.value.setData(state.pages)

        state.sidebarMenu = config.sidebarMenu;

        state.isLoaded = true;
    },
    unloaded (state: any) {
        state.config = {}
        state.isLoaded = true;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}