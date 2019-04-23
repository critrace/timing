import { observable } from 'mobx'
import axios from 'axios'
import PromoterStore from './promoter'

export default class PassingStore {
  @observable _passingById: {
    [key: string]: any
  } = {}
  @observable _passingsByEventId: {
    [key: string]: any
  } = {}

  passingsByEventId(_id: string) {
    return this._passingsByEventId[_id] || []
  }

  passingById(_id: string) {
    return this._passingById[_id] || {}
  }

  async create(model: any) {
    try {
      await axios.post('/passings', {
        ...model,
        token: PromoterStore.activeToken,
      })
    } catch (err) {
      console.log('Error creating passing', err)
      throw err
    }
  }

  async loadByEventId(eventId: string) {
    try {
      const { data } = await axios.get('/passings', {
        params: {
          token: PromoterStore.activeToken,
          eventId,
        },
      })
      const sorted = data.sort((p1: any, p2: any) => {
        if (p1.date < p2.date) return 1
        return -1
      })
      const passingsByTransponder = {} as { [key: string]: number }
      sorted
        .slice()
        .reverse()
        .forEach((passing: any) => {
          passing.lapNumber = passingsByTransponder[passing.transponder] || 0
          passingsByTransponder[passing.transponder] =
            (passingsByTransponder[passing.transponder] || 0) + 1
          this._passingById[passing._id] = passing
        })
      this._passingsByEventId[eventId] = sorted
    } catch (err) {
      console.log('Error loading passings by event id', err)
      throw err
    }
  }

  async delete(_id: string) {
    try {
      await axios.delete('/passings', {
        data: { token: PromoterStore.activeToken, _id },
      })
    } catch (err) {
      console.log('There was an error deleting the passing', err)
      throw err
    }
  }
}
