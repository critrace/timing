import { observable } from 'mobx'
import axios from 'axios'
import PromoterStore from './promoter'

export interface Bib {
  _id: string
  seriesId: string
  riderId: string
  bibNumber: number
  hasRentalTransponder?: boolean
}

export default class BibStore {
  @observable _bibsByRaceId: {
    [key: string]: Bib[]
  } = {}
  @observable _bibsById: {
    [key: string]: Bib
  } = {}

  bibsByRaceId(id: string): Bib[] {
    return this._bibsByRaceId[id] || []
  }

  bibById(id: string): Bib {
    return this._bibsById[id] || ({} as Bib)
  }

  async loadByRaceId(raceId: string) {
    try {
      const { data } = await axios.get('/bibs', {
        params: {
          raceId,
          token: PromoterStore.activeToken,
        },
      })
      data.forEach((bib: any) => {
        this._bibsById[bib._id] = bib
      })
      this._bibsByRaceId[raceId] = data
    } catch (err) {
      console.log('Error loading bib by id', err)
      throw err
    }
  }

  async loadById(_id: string) {
    try {
      const { data } = await axios.get('/bibs', {
        params: {
          _id,
          token: PromoterStore.activeToken,
        },
      })
      this._bibsById[data._id] = data
    } catch (err) {
      console.log('Error loading bib by id', err)
      throw err
    }
  }
}
