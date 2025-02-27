'use strict';

const Utils = require('../../utils/utils');
const Constants = require('../../utils/constants');

class MetadataItem {
  /** @type {string} */
  title;
  
  /** @type {string} */
  value;
  
  constructor (data) {
    this.title = data.title;
    this.value = data.value;
  }
}

class KnowledgeGraph {
  /** @type {string | null} */
  type;
  
  /** @type {string | null} */
  title;
  
  /** @type {string | null} */
  description;
  
  /** @type {string | null} */
  url;
  
  /** @type {{ title: string; value: string }[]} */
  metadata = [];
  
  /** @type {{ title: string; year: string; }[]} */
  books = [];
  
  /** @type {{ title: string; year: string; }[]} */
  tv_shows_and_movies = [];
  
  ratings = [];
  
  /** @type {string[]} */
  available_on = [];
  
  /** @type {{ url: string; source: string }[]} */
  images = [];
  
  /** @type {{ title: string; album: string }[]} */
  songs = [];
  
  /** @type {string | null} */
  demonstration;
  
  /** @type {string | null} */
  lyrics;
  
  /** @type {string[]} */
  socials = [];

  constructor (data, $) {
    this.title = $(Constants.SELECTORS.KNO_PANEL_TITLE[0]).first().text() || $(Constants.SELECTORS.KNO_PANEL_TITLE[1]).text() || null;
    this.description = $(Constants.SELECTORS.KNO_PANEL_DESCRIPTION).first().text() || null;
    this.url = $(Constants.SELECTORS.KNO_PANEL_URL).attr('href') || null;

    // Extract metadata from the knowledge graph
    $(Constants.SELECTORS.KNO_PANEL_METADATA).each((i, el) => {
      const key = $(el).first().text().trim().slice(0, -1);
      const value = $(el).next().text().trim();
      if (value.length) {
        this.metadata.push(new MetadataItem({ title: key, value: value.trim() }));
      }
    });

    const knowledge_panel_type = $(Constants.SELECTORS.KNO_PANEL_TYPE).last().text();
    
    if (knowledge_panel_type && knowledge_panel_type !== this.title) {
      this.type = knowledge_panel_type;
    } else {
      this.type = null;
    }

    this.books = $(Constants.SELECTORS.KNO_PANEL_BOOKS).map((i, el) => {
      const title = $(el).first().text().trim();
      const year = $(el).next().text().trim();
      
      if (year.length)
        return { title, year }
    }).get();

    this.tv_shows_and_movies = $(Constants.SELECTORS.KNO_PANEL_TV_SHOWS_AND_MOVIES).map((i, el) => {
      const title = $(el).first().text().trim();
      const year = $(el).next().text().trim();
      
      if (year.length)
        return { title, year };
    }).get();

    const lyrics = $(Constants.SELECTORS.KNO_PANEL_SONG_LYRICS)
      .map((i, el) =>
        $($(el).html()
          .replace(/<br aria-hidden="true">/g, '\n')
          .replace(/<\/span><\/div><div jsname=".*" class=".*"><span jsname=".*">/g, '\n\n')
          .replace(/<br>/g, '\n')).text()).get();
    
    this.lyrics = lyrics.length ? lyrics.join('\n\n') : null;
    
    const google_users_rating = $(Constants.SELECTORS.KNO_PANEL_FILM_GOOGLEUSERS_RATING)[0];
   
    if (google_users_rating) {
      const rating = $(google_users_rating.children[0].children[0]).text() || null;
      this.ratings.push({
        name: 'Google Users',
        rating: rating
      });
    }

    $(Constants.SELECTORS.KNO_PANEL_FILM_RATINGS[0]).each((i, el) => {
      const name = $($(Constants.SELECTORS.KNO_PANEL_FILM_RATINGS[1])[i]).attr('title');
      const rating = $(el).text();
    
      this.ratings.push({ name, rating });
    });
    
    this.available_on = $(Constants.SELECTORS.KNO_PANEL_AVAILABLE_ON).map((i, el) => $(el).text()).get();

    this.images = $(Constants.SELECTORS.KNO_PANEL_IMAGES).map((i, elem) => {
      const url = $(elem).attr('data-src');
      const source = $(elem).parent().parent().parent().parent().parent().attr('data-lpage');
     
      return { url, source };
    }).get().filter((img) => img.url);
    
    this.songs = $(Constants.SELECTORS.KNO_PANEL_SONGS).map((i, el) => {
      const title = $(el).text().trim();
      const album = $(el).next().find('span').first().text().trim();
      
      return { title, album };
    }).get();

    this.socials = $(Constants.SELECTORS.KNO_PANEL_SOCIALS).map((i, el) => {
      return $(el).attr('href')
    }).get();
     
    const demo = Utils.getStringBetweenStrings(data, 'source src\\x3d\\x22', '.mp4');
    this.demonstration = demo ? `${demo}.mp4` : null;
  }
}

module.exports = KnowledgeGraph;