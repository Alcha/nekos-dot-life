const {get} = require('https');
const {URL, URLSearchParams} = require('url');
const endpoints = require('./endpoints.json');

function getContent(url) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      const {statusCode} = res;
      if(statusCode !== 200) {
        res.resume();
        reject(`Request failed. Status code: ${statusCode}`);
      }
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => {rawData += chunk});
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch(e) {
          reject(`Error: ${e.message}`);
        }
      });
    }).on('error', (err) => {
      reject(`Error: ${err.message}`);
    })
  });
}

class NekoClient {
  /**
   * @param {String} [contentType] The type of content you want to query for
   */
  constructor(contentType) {
    this.baseURL = 'https://nekos.life/api/v2';

    if (contentType === undefined) {
      this.assignNSFWFunctions();
      this.assignSFWFunctions();
    } else if (contentType.toLocaleLowerCase() === 'nsfw') {
      this.assignNSFWFunctions();
    } else if (contentType.toLocaleLowerCase() === 'sfw') {
      this.assignSFWFunctions();
    }
  }

  assignNSFWFunctions () {
    let self = this
    Object.keys(endpoints.nsfw).forEach( async (endpoint) => {
      self[`getNSFW${endpoint}`] = async function (queryParams = '') {
        let url = new URL(`${self.baseURL}${endpoints.nsfw[endpoint]}`);
        queryParams !== '' ? url.search = new URLSearchParams(queryParams) : '';
        return await getContent(url.toString());
      };
    });
  }

  assignSFWFunctions () {
    let self = this
    Object.keys(endpoints.sfw).forEach(async (endpoint) => {
      self[`getSFW${endpoint}`] = async function (queryParams = '') {
        let url = new URL(`${self.baseURL}${endpoints.sfw[endpoint]}`);
        queryParams !== '' ? url.search = new URLSearchParams(queryParams) : '';
        return await getContent(url.toString());
        };
    });
  }
}

module.exports = NekoClient;
