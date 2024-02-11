/* eslint-disable no-undef */
import { select, settings, templates } from '../settings.js';
import utils from '../utils.js';

class Review {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
  }

  render(element) {
    const thisHome = this;
    const url = settings.db.url + '/' + settings.db.reviews;
    thisHome.data = {};
    fetch(url)
      .then((res) => {
        return res.json();
      })
      .then((parsedRes) => {
        const generatedHTML = templates.reviews(parsedRes);
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);
        thisHome.dom = {};
        thisHome.dom.wrapper = element;
        document.querySelector(select.containerOf.reviews).appendChild(generatedDOM);



      }).then(() => {
        var elem = document.querySelector(select.containerOf.mainCarousel);
        new Flickity( elem, {
          cellAlign: 'left',
          contain: true,
          autoPlay: true
        });

      });



  }



}
export default Review;