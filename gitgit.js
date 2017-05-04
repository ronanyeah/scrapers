'use strict'

/*
 * scrapes github profiles based on gitter room membership
 */

require('dotenv').config()

const { futchJson } = require('rotools')
const { parallel, of } = require('fluture')
const { pick, flip, map, concat, pluck, propSatisfies, gt, partial, ifElse, isNil, reject, pipe } = require('ramda')

const { GITTER_ROOM_ID, GITTER_TOKEN, GITHUB_TOKEN } = process.env

const lengthIsLessThan100 = propSatisfies(gt(100), 'length')

const gitterRoomUsers =
  (roomId, acc = []) =>
    futchJson(
      `https://api.gitter.im/v1/rooms/${roomId}/users?limit=100&skip=${acc.length}`,
      { headers: { Authorization: `Bearer ${GITTER_TOKEN}` } }
    )
    .chain(
      ifElse(
        lengthIsLessThan100,
        pipe(concat(acc), of),
        pipe(concat(acc), partial(gitterRoomUsers, [roomId]))
      )
    )

const go =
  gitterRoomUsers(GITTER_ROOM_ID)
  .map(pluck('username'))
  .chain(
    pipe(
      map(
        pipe(
          concat('https://api.github.com/users/'),
          flip(futchJson)(
            { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
          )
        )
      ),
      parallel(15)
    )
  )
  .map(
    map(pipe(pick((['name', 'location', 'email', 'company', 'login'])), reject(isNil)))
  )
