import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import axios from 'axios'
import { Provider } from 'mobx-react'
import Home from './Home'
import PromoterStore from './stores/promoter'
import DecoderStore from './stores/decoder'
import PassingStore from './stores/passing'
import RiderStore from './stores/rider'
import BibStore from './stores/bib'
import Colors from './Colors'

axios.defaults.baseURL = 'https://api.critrace.com'
// axios.defaults.baseURL = 'http://localhost:4000'
axios.defaults.headers['content-type'] = 'application/json'

Object.assign(document.body.style, {
  margin: 'auto',
  backgroundColor: Colors.white,
  'font-family': 'Helvetica',
})

const stores = {
  promoter: new PromoterStore(),
  decoder: new DecoderStore(),
  passing: new PassingStore(),
  rider: new RiderStore(),
  bib: new BibStore(),
}

ReactDOM.render(
  <Provider {...stores}>
    <Router>
      <Route path="/" component={Home} />
    </Router>
  </Provider>,
  document.getElementById('app')
)
