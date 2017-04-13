'use strict'

/*
 * Web scraper to watch for new tickets to a sold out event.
 */

const fetch   = require('node-fetch')
const co      = require('co')
const cheerio = require('cheerio')

const { senderEmail, password } = require('/home/ronan/storage/code/assets/home/mailConfig.json')
const emailer =
  require('/home/ronan/github/home/tools/emailer.js')(senderEmail, password)

module.exports = _ =>
  co(function* () {

    const url = 'https://www.premieronline.com/event/Johnson_Arabia_Dubai_Creek_Striders_Half_Marathon_2016_1992'

    const page = yield fetch(url)
    .then(
      res =>
        res.status === 200
          ? res.text()
          : Promise.reject(`Bad response! Status code: ${res.status}`)
    )

    const $ = cheerio.load(page)

    const availabilityImage = $('#event_page_reg_btn').children('img').attr('src')

    return availabilityImage !== 'https://www.premieronline.com/layout/images/bad_sold_out.png'
      ? yield emailer(
          senderEmail,
          'Ronan',
          'DUBAI',
          `Image: ${availabilityImage}\nCheck now: ${url}`
        )
      : 'no luck'
  })
  .then( console.log )
  .catch( console.log )
