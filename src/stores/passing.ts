import { observable } from 'mobx'
import axios from 'axios'
import PromoterStore from './promoter'

export default class PassingStore {
  @observable passingsByRaceId: {
    [key: string]: any
  } = {}

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
      this.passingsByRaceId[raceId] = data
    } catch (err) {
      console.log('Error loading passings', err)
      throw err
    }
  }
}
