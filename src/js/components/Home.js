import { templates } from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);

  }

  render(element) {
    const thisHome = this;
    const generatedHTML = templates.homepage(element);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.appendChild(generatedDOM);
  }


}
export default Home;