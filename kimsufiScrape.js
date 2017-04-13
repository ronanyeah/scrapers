'use strict'

const { futch, futchJson } = require('rotools')
const { of } = require('fluture')
const { find, path, propEq, prop, pluck, all, equals, pipe } = require('ramda')

const push = msg =>
  futch(
    'https://ronanmccabe.me/push',
    { method: 'POST', body: JSON.stringify({ password: process.env.PW, text: msg }) }
  )

const go =
  futchJson(
    'https://ws.ovh.com/dedicated/r2/ws.dispatcher/getAvailability2'
  )
  .map(pipe(
    path(['answer', 'availability']),
    find(propEq('reference', '160sk1')),
    prop('metaZones'),
    pluck('availability'),
    all(equals('unavailable'))
  ))
  .chain(
    notAvailable =>
      notAvailable
        ? of(':(')
        : push('BUY A SERVER!')
          .map(
            _ =>
              'BUY A SERVER!'
          )
  )

setInterval(
  () =>
    go
    .fork(
      err =>
        console.log(err.message),
      console.log
    ),
  60000
)
