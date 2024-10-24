import { checkThirdParty } from './thirdParty';

const IS_DEBUG = process.env.IS_DEBUG && true;

interface GTMEvent {
  event: string;
  event_category?: string;
  event_label?: string;
  page_title?: string;
  page_path?: string;
}

class GTM {
  isInitialized = false;
  queuedEvents = [];
  checkInterval = null;

  private _hasTrackingConsent = false;

  get hasTrackingConsent() {
    return this._hasTrackingConsent;
  }

  set hasTrackingConsent(value: boolean) {
    if (IS_DEBUG) console.log('Google Tag Manager: setTrackingConsent', value);
    this._hasTrackingConsent = value;
  }

  initialize(hasConsent = false, hasExternalScript = false) {
    if (this.isInitialized) {
      if (IS_DEBUG) console.log('Google Tag Manager: Already initialised');
      return;
    }

    this.hasTrackingConsent = hasConsent;

    if (!this.hasTrackingConsent) {
      if (IS_DEBUG) {
        console.log(
          'Google Tag Manager: Tracking disabled - initialisation prevented'
        );
      }
      return;
    }

    if (IS_DEBUG) {
      console.log('Google Tag Manager: Tracking enabled - initialisation');
    }

    const proceed = () => {
      window['dataLayer'] = window['dataLayer'] || [];
      window['gtag'] = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window['dataLayer'].push(arguments);
      };

      window['gtag']('js', new Date());
      window['gtag']('config', process.env.GTM_ID, { anonymize_ip: true });
      if (!hasExternalScript)
        window['dataLayer'].push({
          'gtm.start': new Date().getTime(),
          event: 'gtm.js',
        });

      this.isInitialized = true;
      if (IS_DEBUG)
        console.log(
          `Google Tag Manager: Initialised${
            hasExternalScript ? ' (with external script tag)' : ''
          }`
        );
      this.dispatchQueue();
    };

    if (!hasExternalScript) {
      const root = document.head;
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.GTM_ID}`;
      root.appendChild(script);
    }

    checkThirdParty('dataLayer', this.checkInterval, proceed);
  }

  trackEvent(category: string, action: string, label = '') {
    if (!this.hasTrackingConsent && this.isInitialized) {
      if (IS_DEBUG) {
        console.log(
          `Google Tag Manager: Tracking disabled - event not tracked ("${category}", "${action}", "${label}")`
        );
      }
      return;
    }

    // Send the event (will be queued if tracking not initialised yet)
    this.sendEvent({
      event: action,
      event_category: category,
      event_label: label,
    });
  }

  trackPage(pagePath = '', pageTitle = '') {
    const pathname = pagePath || window.location.pathname;
    const title = pageTitle || document.title;

    if (!this.hasTrackingConsent && this.isInitialized) {
      if (IS_DEBUG) {
        console.log(
          `Google Tag Manager: Tracking disabled - page not tracked ("${pathname}" - "${title}")`
        );
      }
      return;
    }

    // Send the event (will be queued if tracking not initialised yet)
    this.sendEvent({
      event: 'pageView',
      page_title: title,
      page_path: pathname,
    });
  }

  private sendEvent(event: GTMEvent) {
    if (!this.isInitialized) {
      if (IS_DEBUG) {
        console.log(
          'Google Tag Manager: Not initialised, adding data to queued events',
          event
        );
      }
      this.queuedEvents.push(event);
      return;
    }

    if (IS_DEBUG) {
      console.log('%cSEND TRACKING DATA:', 'font-weight: bold;', event);
    }

    window['gtag']('event', event.event, event);
  }

  private dispatchQueue() {
    if (this.queuedEvents.length) {
      if (IS_DEBUG) console.log('Google Tag Manager: Dispatching queued event');
      this.sendEvent(this.queuedEvents[0]);
      this.queuedEvents.shift();
      this.dispatchQueue();
    }
  }
}

export default new GTM();
