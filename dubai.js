'use strict'

/*
 * Web scraper to watch for new tickets to a sold out event.
 */

require('dotenv').config()

const fetch = require('node-fetch')
const co = require('co')
const cheerio = require('cheerio')
const { emailer } = require('rotools')

const { GMAIL_ADDRESS, GMAIL_PW } = process.env
const sendEmail = emailer(GMAIL_ADDRESS, GMAIL_PW)

const go = co.wrap(
  function * () {

    const url = 'https://www.premieronline.com/event/Johnson_Arabia_Dubai_Creek_Striders_Half_Marathon_2016_1992'

    const page = yield fetch(url)
    .then(
      res =>
        res.status === 200
          ? res.text()
          : Promise.reject(Error(`Bad response! Status code: ${res.status}`))
    )

    const $ = cheerio.load(page)

    const availabilityImage = $('#event_page_reg_btn').children('img').attr('src')

    return availabilityImage !== 'https://www.premieronline.com/layout/images/bad_sold_out.png'
      ? yield sendEmail(
          GMAIL_ADDRESS,
          'Ronan',
          'DUBAI',
          `Image: ${availabilityImage}\nCheck now: ${url}`
        ).promise()
      : 'no luck'
  })
