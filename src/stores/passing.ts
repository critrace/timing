import { observable } from 'mobx'
import axios from 'axios'
import PromoterStore from './promoter'

export default class PassingStore {
  @observable _passingsByRaceId: {
    [key: string]: any
  } = {}

  @observable
  passingsByRaceId(_id: string) {
    return this._passingsByRaceId[_id] || []
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

  async load(raceId: string) {
    try {
      const { data } = await axios.get('/passings', {
        params: {
          token: PromoterStore.activeToken,
          raceId,
        },
      })
      this._passingsByRaceId[raceId] = data.sort((p1, p2) => {
        if (p1.date > p2.date) return 1
        return -1
      })
    } catch (err) {
      console.log('Error loading passings', err)
      throw err
    }
  }
}
