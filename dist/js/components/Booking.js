import { classNames, select, settings, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.pickedTable = null;
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam
      ]
    };

    const urls = {
      bookings: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then((allRes) => {
        const bookingsResponse = allRes[0];
        const eventsCurrentRes = allRes[1];
        const eventsRepeatRes = allRes[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentRes.json(),
          eventsRepeatRes.json()
        ]);
      })
      .then(([bookings, eventsCurrent, eventsRepeat]) => {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });


  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBoooked(item.date, item.hour, item.duration, item.table);

    }
    for (let item of eventsCurrent) {
      thisBooking.makeBoooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBoooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }

    }
    thisBooking.updateDOM();
  }

  makeBoooked(date, hour, duration, table) {

    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};

    }
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }





  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }


      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }



  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.appendChild(generatedDOM);
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);
    this;
    thisBooking.dom.button = element.querySelector(select.booking.button);
    thisBooking.dom.phone = element.querySelector(select.booking.phoneNumber);
    thisBooking.dom.address = element.querySelector(select.booking.address);
    thisBooking.dom.starters = element.querySelectorAll(select.booking.starters);


  }

  initTables(event) {
    const thisBooking = this;
    const clickedElement = event.target;

    if (clickedElement.classList.contains('table')) {
      if (clickedElement.classList.contains(classNames.booking.tableBooked)) {
        alert('This table is booked, please choose another one!');
      } else {
        if (!clickedElement.classList.contains(classNames.booking.selected)) {
          thisBooking.unselectTables();
          thisBooking.pickedTable = clickedElement.getAttribute(settings.booking.tableIdAttribute);
          clickedElement.classList.add(classNames.booking.selected);
        } else {
          thisBooking.pickedTable = null;
          clickedElement.classList.remove(classNames.booking.selected);
        }
      }
    }
  }


  unselectTables() {
    const thisBooking = this;
    for (let table of thisBooking.dom.tables) {
      if (table.classList.contains(classNames.booking.selected)) {
        table.classList.remove(classNames.booking.selected);
        thisBooking.pickedTable = null;
      }
    }

  }

  sendBooking() {
    const thisBooking = this;
    let url = settings.db.url + '/' + settings.db.bookings;

    const payload = {
      'date': thisBooking.datePicker.correctValue,
      'hour': thisBooking.hourPicker.correctValue,
      'table': parseInt(thisBooking.pickedTable),
      'duration': parseInt(thisBooking.hoursAmount.value),
      'ppl': parseInt(thisBooking.peopleAmount.value),
      'starters': [],
      'phone': thisBooking.dom.phone.value,
      'address': thisBooking.dom.address.value
    };

    for (let starter of thisBooking.dom.starters) {
      if (starter.checked) {
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    };

    console.log(payload);

    fetch(url, options).then(res => {
      return res.json();
    }).then(() => {
      thisBooking.makeBoooked(payload.date, payload.hour, payload.duration, payload.table);
      thisBooking.updateDOM();
    });



  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', () => {
      thisBooking.updateDOM();
      thisBooking.unselectTables();
    });

    thisBooking.dom.floorPlan.addEventListener('click', (event) => {
      event.preventDefault();
      thisBooking.initTables(event);
    });

    thisBooking.dom.button.addEventListener('click', (event) => {
      event.preventDefault();
      thisBooking.sendBooking();

    });
  }
}
export default Booking;