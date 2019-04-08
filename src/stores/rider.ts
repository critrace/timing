import { observable } from 'mobx'
import axios from 'axios'
import PromoterStore from './promoter'

export interface Rider {
  _id: string
  firstname: string
  lastname: string
  license: string
}

export default class RiderStore {
  @observable _ridersById: {
    [key: string]: Rider
  } = {}

  ridersById(id: string): Rider {
    return {
      firstname: 'unknown',
      lastname: 'RIDER',
      ...(this._ridersById[id] || {}),
    } as Rider
  }

  async loadIfNeeded(_id: string) {
    if (this._ridersById[_id]) return
    await this.load(_id)
  }

  async load(_id: string) {
    try {
      const { data } = await axios.get('/riders', {
        params: {
          _id,
          token: PromoterStore.activeToken,
        },
      })
      this._ridersById[_id] = data
    } catch (err) {
      console.log('Error loading rider by id', err)
      throw err
    }
  }

  async update(where: string | object, changes: any) {
    try {
      await axios.put('/riders', {
        where: typeof where === 'string' ? { _id: where } : where,
        changes,
        token: PromoterStore.activeToken,
      })
    } catch (err) {
      console.log('Error updating document', err)
      throw err
    }
  }

  async search(value: string) {
    try {
      const { data } = await axios.get('/riders/search', {
        params: {
          search: value,
          token: PromoterStore.activeToken,
        },
      })
      return data
    } catch (err) {
      console.log('Error searching', err)
      throw err
    }
  }
}
