import { computed, observable, runInAction } from 'mobx'
import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import { remote } from 'electron'
const { app } = remote

const storagePath = path.join(app.getPath('userData'), 'storage.json')

export interface Promoter {
  _id: string
  createdAt: string
  email: string
}

export default class PromoterStore {
  @observable token: string
  @observable userId: string
  @observable _promotersById: {
    [key: string]: Promoter
  } = {}

  promotersById(id: string): Promoter {
    return this._promotersById[id] || ({} as Promoter)
  }

  constructor() {
    try {
      if (!fs.existsSync(storagePath)) {
        fs.writeFileSync(storagePath, JSON.stringify({}))
      }
      const data = fs.readFileSync(storagePath, 'utf8')
      const { token, active } = JSON.parse(data.toString())
      this.token = token
      if (active) {
        this.userId = active._id
        this._promotersById[active._id] = active
      }
      if (this.authenticated) {
        this.loadPromoter().catch(() => {})
      }
    } catch (err) {
      console.log('Error loading user data', err)
    }
  }

  @computed
  get active() {
    return this._promotersById[this.userId] || ({} as Promoter)
  }

  @computed
  get authenticated() {
    return !!this.userId
  }

  /**
   * Call with arguments to filter, otherwise retrieve own profile
   **/
  async loadPromoter(_id?: string) {
    try {
      const { data } = await axios.get('/promoters', {
        params: {
          _id,
          token: this.token,
        },
      })
      runInAction(() => {
        this._promotersById[data._id] = data
      })
    } catch (err) {
      console.log(err.response.data.message)
      throw err
    }
  }

  async login(email: string, password: string) {
    try {
      const { data } = await axios.post('/promoters/login', {
        email,
        password,
      })
      runInAction(() => {
        const fileData = fs.readFileSync(storagePath, 'utf8')
        const parsed = JSON.parse(fileData.toString())
        Object.assign(parsed, {
          token: data.token,
          active: data,
        })
        fs.writeFileSync(storagePath, JSON.stringify(parsed))
        this.token = data.token
        this._promotersById[data._id] = data
        this.userId = data._id
      })
    } catch (err) {
      console.log(err.response.data.message)
      throw err
    }
  }

  logout() {
    fs.writeFileSync(storagePath, JSON.stringify({}))
    this.token = undefined
    this.userId = undefined
  }
}
