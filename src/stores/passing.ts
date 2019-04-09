import { observable } from 'mobx'
import axios from 'axios'
import PromoterStore from './promoter'

export default class PassingStore {
  @observable _passingsByRaceId: {
    [key: string]: any
  } = {}
  @observable _passingById: {
    [key: string]: any
  } = {}

  passingsByRaceId(_id: string) {
    return this._passingsByRaceId[_id] || []
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

  async loadByRaceId(raceId: string) {
    try {
      const { data } = await axios.get('/passings', {
        params: {
          token: PromoterStore.activeToken,
          raceId,
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
      this._passingsByRaceId[raceId] = sorted
    } catch (err) {
      console.log('Error loading passings', err)
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
