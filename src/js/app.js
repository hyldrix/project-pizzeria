import Cart from './components/Cart.js';
import Product from './components/Product.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';

import { classNames, select, settings } from './settings.js';
import Review from './components/Reviews.js';

const app = {
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then((res) => {
        return res.json();
      })
      .then((parsedRes) => {
        thisApp.data.products = parsedRes;
        app.initMenu();
      });

  },
  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', (event) => {
      app.cart.add(event.detail.product);
    });
  },

  initPages: function () {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;
    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();
        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);
        window.location.hash = '#/' + id;
      });

    }
  },


  activatePage: function (pageId) {
    const thisApp = this;
    for (let page of thisApp.pages) {
      // if (page.id === pageId) {
      //   page.classList.add(classNames.pages.active);
      // } else {
      //   page.classList.remove(classNames.pages.active);
      // }
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    for (let link of thisApp.navLinks) {
      // if (page.id === pageId) {
      //   page.classList.add(classNames.pages.active);
      // } else {
      //   page.classList.remove(classNames.pages.active);
      // }
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId);
    }


  },

  activateHomeButtons() {
    const thisApp = this;
    document.querySelectorAll('.home-nav').forEach((button) => {
      const link = button.querySelector('a').getAttribute('href');
      const pageId = link.replace('#', '');
      button.addEventListener('click', (event) => {
        event.preventDefault();
        thisApp.activatePage(pageId);
      });

    });
  },

  initBooking: function () {
    const thisApp = this;
    const bookingWidgetContainer = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingWidgetContainer);
  },

  initHomepage: function () {
    const thisApp = this;
    const homepageContainer = document.querySelector(select.containerOf.homepage);
    thisApp.homepage = new Home(homepageContainer);
  },

  initReviews: function () {
    const thisApp = this;
    const reviewContainer = document.querySelector(select.containerOf.reviews);
    thisApp.review = new Review(reviewContainer);
  },

  init: function () {
    const thisApp = this;
    thisApp.initData();
    thisApp.initCart();
    thisApp.initHomepage();
    thisApp.initPages();
    thisApp.initBooking();
    thisApp.initReviews();
    thisApp.activateHomeButtons();
  },

};

app.init();

