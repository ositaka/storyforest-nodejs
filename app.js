require('dotenv').config();

const logger = require('morgan');
const express = require('express');
const methodOverride = require('method-override');

const port = 3000;
const app = express();
const path = require('path');

const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride());
// app.use(errorHandler());
app.use(express.static(path.join(__dirname, 'public')));

const Prismic = require('@prismicio/client');
const PrismicDOM = require('prismic-dom');
const UAParser = require('ua-parser-js');

const initApi = (req) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req
  });
};

const handleLinkResolver = (doc) => {
  if (doc.type === '404') {
    return `/${doc.lang}/`;
  }

  if (doc.type === 'home') {
    if (doc.lang === 'en-gb') {
      return `/en/`;
    }
    else if (doc.lang === 'pt-pt') {
      return `/pt/`;
    }
  }

  if (doc.type === 'page') {
    if (doc.lang === 'en-gb') {
      return (doc.data.parent_page.id ? `/en/${doc.data.parent_page.uid}/${doc.uid}/` : `/en/${doc.uid}/`)
    }
    else if (doc.lang === 'pt-pt') {
      return (doc.data.parent_page.id ? `/pt/${doc.data.parent_page.uid}/${doc.uid}/` : `/pt/${doc.uid}/`)
    }
  }

  // if (doc.type === 'work') {
  //   return `/${doc.lang}/${doc.uid}/`;
  // }

  // if (doc.type === 'work_page') {
  // return (doc.data.parent_page.id ? `/${doc.lang}/${doc.data.parent_page.uid}/${doc.uid}/` : `/${doc.lang}/${doc.uid}/`)
  // }

  // if (doc.type === 'team') {
  //   if (doc.lang === 'pt-pt') {
  //     return `/pt/${doc.uid}/`;
  //   }
  // }

  if (doc.type === 'contacts') {
    if (doc.lang === 'en-gb') {
      return `/en/${doc.uid}/`;
    }
    else if (doc.lang === 'pt-pt') {
      return `/pt/${doc.uid}/`;
    }
  }

  // if (doc.type === 'services') {
  //   return `/${doc.lang}/${doc.uid}/`;
  // }

  // if (doc.type === 'service_page') {
  //   return (doc.data.parent_page.id ? `/${doc.lang}/${doc.data.parent_page.uid}/${doc.uid}/` : `/${doc.lang}/${doc.uid}/`)
  // }

  return `/en/`;
};

app.use((req, res, next) => {
  const ua = UAParser(req.headers['user-agent']);

  res.locals.isDesktop = ua.device.type === undefined;
  res.locals.isPhone = ua.device.type === 'mobile';
  res.locals.isTablet = ua.device.type === 'tablet';

  res.locals.Link = handleLinkResolver;

  res.locals.Numbers = (index) => {
    return index == 0
      ? 'One'
      : index == 1
        ? 'Two'
        : index == 2
          ? 'Three'
          : index == 3
            ? 'Four'
            : '';
  };

  res.locals.PrismicDOM = PrismicDOM;

  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const handleRequest = async (api, lang) => {
  const intro = await api.getSingle('intro');
  const footer = await api.getSingle('footer', { lang });
  const navigation = await api.getSingle('navigation', { lang });
  const preloader = await api.getSingle('preloader', { lang });
  const assets = [];
  const { results: calendar } = await api.query(Prismic.Predicates.at('document.type', 'school_calendar'), {
    lang,
    // orderings: '[my.school_calendar.event_date asc]'
  })


  calendar_events = calendar[0].data.events

  calendar_events.sort(function (a, b) {
    return new Date(a.event_date) - new Date(b.event_date)
  })

  console.log(calendar_events)

  intro.data.gallery.forEach((item) => {
    assets.push(item.image.url);
  });

  return {
    assets,
    calendar_events,
    intro,
    footer,
    navigation,
    preloader
  };
};


app.get('/', async (req, res) => {
  res.redirect('/en/')
})

app.get('/en/', async (req, res) => {
  const lang = 'en-gb';
  const api = await initApi(req);
  const defaults = await handleRequest(api, lang);

  const home = await api.getSingle('home', { lang });

  if (home) {
    altLangs = home.alternate_languages
    meta = home.data.seo[0]

    // const { results: globals } = await api.query(Prismic.Predicates.at('document.type', 'globals'), { lang })
    // const { results: packs } = await api.query(Prismic.Predicates.at('document.type', 'pack'), {
    //   lang,
    //   orderings: '[my.pack.homepage_order]'
    // })

    res.render('pages/home', {
      ...defaults,
      altLangs,
      // globals,
      lang,
      meta,
      home,
      // packs
    });

  }

  else {
    console.log("_404")
    // res.status(404).render("./error_handlers/_404");
  }

});

app.get('/pt/', async (req, res) => {
  const lang = 'pt-pt';
  const api = await initApi(req);
  const defaults = await handleRequest(api, lang);

  const home = await api.getSingle('home', { lang });

  if (home) {
    altLangs = home.alternate_languages
    meta = home.data.seo[0]

    // const { results: globals } = await api.query(Prismic.Predicates.at('document.type', 'globals'), { lang })
    // const { results: packs } = await api.query(Prismic.Predicates.at('document.type', 'pack'), {
    //   lang,
    //   orderings: '[my.pack.homepage_order]'
    // })

    res.render('pages/home', {
      ...defaults,
      altLangs,
      // globals,
      lang,
      meta,
      home,
      // packs
    });

  }

  else {
    console.log("_404")
    // res.status(404).render("./error_handlers/_404");
  }

});

app.get('/en/:uid/', async (req, res) => {
  const lang = 'en-gb';
  const uid = req.params.uid;
  const api = await initApi(req);
  const defaults = await handleRequest(api, lang);

  const contacts = await api.getByUID('contacts', uid, { lang });
  const page = await api.getByUID('page', uid, { lang });
  // const services = await api.getByUID('services', uid, { lang });
  // const team = await api.getByUID('team', uid, { lang });
  // const work = await api.getByUID('work', uid, { lang });


  if (page) {
    if (page.data.parent_page.uid) {
      res.redirect(`/en/${page.data.parent_page.uid}/${page.uid}/`)
    }

    const { results: parent_en } = await api.query(Prismic.Predicates.at('document.type', 'page'), { lang: "en-gb" })
    const { results: parent_pt } = await api.query(Prismic.Predicates.at('document.type', 'page'), { lang: "pt-pt" })

    altLangs = page.alternate_languages
    meta = page.data.seo[0]

    // const { results: globals } = await api.query(Prismic.Predicates.at('document.type', 'globals'), { lang })

    res.render('pages/pages', {
      ...defaults,
      altLangs,
      lang,
      meta,
      // globals,
      page,
      parent_en,
      parent_pt
    });
  }

  // else if (team) {
  //   altLangs = team.alternate_languages
  //   meta = team.data.seo[0]

  //   res.render('pages/team', {
  //     ...defaults,
  //     altLangs,
  //     lang,
  //     meta,
  //     team,
  //   });
  // }

  else if (contacts) {
    altLangs = contacts.alternate_languages
    meta = contacts.data.seo[0]

    // const { results: globals } = await api.query(Prismic.Predicates.at('document.type', 'globals'), { lang })

    res.render('pages/contacts', {
      ...defaults,
      altLangs,
      lang,
      meta,
      // globals,
      contacts,
    });
  }

  else {
    console.log("_404")
    // res.status(404).render("./error_handlers/_404");
  }

});


app.get('/pt/:uid/', async (req, res) => {
  const lang = 'pt-pt';
  const uid = req.params.uid;
  const api = await initApi(req);
  const defaults = await handleRequest(api, lang);

  const contacts = await api.getByUID('contacts', uid, { lang });
  const page = await api.getByUID('page', uid, { lang });
  // const services = await api.getByUID('services', uid, { lang });
  // const team = await api.getByUID('team', uid, { lang });
  // const work = await api.getByUID('work', uid, { lang });


  if (page) {
    if (page.data.parent_page.uid) {
      res.redirect(`/pt/${page.data.parent_page.uid}/${page.uid}/`)
    }

    const { results: parent_en } = await api.query(Prismic.Predicates.at('document.type', 'page'), { lang: "en-gb" })
    const { results: parent_pt } = await api.query(Prismic.Predicates.at('document.type', 'page'), { lang: "pt-pt" })

    altLangs = page.alternate_languages
    meta = page.data.seo[0]

    // const { results: globals } = await api.query(Prismic.Predicates.at('document.type', 'globals'), { lang })

    res.render('pages/pages', {
      ...defaults,
      altLangs,
      lang,
      meta,
      // globals,
      page,
      parent_en,
      parent_pt
    });
  }

  // else if (team) {
  //   altLangs = team.alternate_languages
  //   meta = team.data.seo[0]

  //   res.render('pages/team', {
  //     ...defaults,
  //     altLangs,
  //     lang,
  //     meta,
  //     team,
  //   });
  // }

  else if (contacts) {
    altLangs = contacts.alternate_languages
    meta = contacts.data.seo[0]

    // const { results: globals } = await api.query(Prismic.Predicates.at('document.type', 'globals'), { lang })

    res.render('pages/contacts', {
      ...defaults,
      altLangs,
      lang,
      meta,
      // globals,
      contacts,
    });
  }

  else {
    console.log("_404")
    // res.status(404).render("./error_handlers/_404");
  }

});


app.get('/en/:parent_page/:uid/', async (req, res) => {
  const lang = 'en-gb';
  const api = await initApi(req);
  const defaults = await handleRequest(api, lang);
  const uid = req.params.uid;

  // const _404 = await api.getSingle('404', { lang });
  // const service_page = await api.getByUID('service_page', uid, { lang });
  // const work_page = await api.getByUID('work_page', uid, { lang });
  const page = await api.getByUID('page', uid, { lang });


  // else if (work_page) {
  //   altLangs = work_page.alternate_languages
  //   meta = work_page.data.seo[0]

  //   const { results: parent_en } = await api.query(Prismic.Predicates.at('document.type', 'work_page'), { lang: "en-gb" })
  //   const { results: parent_pt } = await api.query(Prismic.Predicates.at('document.type', 'work_page'), { lang: "pt-pt" })
  //   const { results: globals } = await api.query(Prismic.Predicates.at('document.type', 'globals'), { lang })


  //   console.log(globals)

  //   res.render('pages/work_page', {
  //     ...defaults,
  //     _404,
  //     altLangs,
  //     globals,
  //     lang,
  //     meta,
  //     parent_en,
  //     parent_pt,
  //     work_page,
  //   });
  // }

  if (page) {
    altLangs = page.alternate_languages
    meta = page.data.seo[0]

    const { results: parent_en } = await api.query(Prismic.Predicates.at('document.type', 'page'), { lang: "en-gb" })
    const { results: parent_pt } = await api.query(Prismic.Predicates.at('document.type', 'page'), { lang: "pt-pt" })
    // const { results: globals } = await api.query(Prismic.Predicates.at('document.type', 'globals'), { lang })

    res.render('pages/pages', {
      ...defaults,
      // _404,
      altLangs,
      // globals,
      lang,
      meta,
      parent_en,
      parent_pt,
      page,
    });
  }

  // else if (service_page) {
  //   altLangs = service_page.alternate_languages
  //   meta = service_page.data.seo[0]

  //   // const { results: service_pages } = await api.query(Prismic.Predicates.at('document.type', 'service_page'), {
  //   //   lang,
  //   //   fetchLinks: 'title',
  //   //   orderings: '[document.first_publication_date]',
  //   // })

  //   // const { results: globals } = await api.query(Prismic.Predicates.at('document.type', 'globals'), { lang })
  //   const { results: parent_en } = await api.query(Prismic.Predicates.at('document.type', 'service_page'), { lang: "en-gb" })
  //   const { results: parent_pt } = await api.query(Prismic.Predicates.at('document.type', 'service_page'), { lang: "pt-pt" })

  //   res.render('pages/service_page', {
  //     ...defaults,
  //     // _404,
  //     altLangs,
  //     // globals,
  //     lang,
  //     meta,
  //     parent_en,
  //     parent_pt,
  //     // service_page,
  //     // service_pages,
  //   });
  // }

  else {
    console.log("_404")
    res.status(404).render("pages/_404");
  }
});

app.get('/pt/:parent_page/:uid/', async (req, res) => {
  const lang = 'pt-pt';
  const api = await initApi(req);
  const defaults = await handleRequest(api, lang);
  const uid = req.params.uid;

  // const _404 = await api.getSingle('404', { lang });
  // const service_page = await api.getByUID('service_page', uid, { lang });
  // const work_page = await api.getByUID('work_page', uid, { lang });
  const page = await api.getByUID('page', uid, { lang });


  // else if (work_page) {
  //   altLangs = work_page.alternate_languages
  //   meta = work_page.data.seo[0]

  //   const { results: parent_en } = await api.query(Prismic.Predicates.at('document.type', 'work_page'), { lang: "en-gb" })
  //   const { results: parent_pt } = await api.query(Prismic.Predicates.at('document.type', 'work_page'), { lang: "pt-pt" })
  //   const { results: globals } = await api.query(Prismic.Predicates.at('document.type', 'globals'), { lang })


  //   console.log(globals)

  //   res.render('pages/work_page', {
  //     ...defaults,
  //     _404,
  //     altLangs,
  //     globals,
  //     lang,
  //     meta,
  //     parent_en,
  //     parent_pt,
  //     work_page,
  //   });
  // }

  if (page) {
    altLangs = page.alternate_languages
    meta = page.data.seo[0]

    const { results: parent_en } = await api.query(Prismic.Predicates.at('document.type', 'page'), { lang: "en-gb" })
    const { results: parent_pt } = await api.query(Prismic.Predicates.at('document.type', 'page'), { lang: "pt-pt" })
    // const { results: globals } = await api.query(Prismic.Predicates.at('document.type', 'globals'), { lang })

    res.render('pages/pages', {
      ...defaults,
      // _404,
      altLangs,
      // globals,
      lang,
      meta,
      parent_en,
      parent_pt,
      page,
    });
  }

  // else if (service_page) {
  //   altLangs = service_page.alternate_languages
  //   meta = service_page.data.seo[0]

  //   // const { results: service_pages } = await api.query(Prismic.Predicates.at('document.type', 'service_page'), {
  //   //   lang,
  //   //   fetchLinks: 'title',
  //   //   orderings: '[document.first_publication_date]',
  //   // })

  //   // const { results: globals } = await api.query(Prismic.Predicates.at('document.type', 'globals'), { lang })
  //   const { results: parent_en } = await api.query(Prismic.Predicates.at('document.type', 'service_page'), { lang: "en-gb" })
  //   const { results: parent_pt } = await api.query(Prismic.Predicates.at('document.type', 'service_page'), { lang: "pt-pt" })

  //   res.render('pages/service_page', {
  //     ...defaults,
  //     // _404,
  //     altLangs,
  //     // globals,
  //     lang,
  //     meta,
  //     parent_en,
  //     parent_pt,
  //     service_page,
  //     // service_pages,
  //   });
  // }

  else {
    console.log("_404")
    res.status(404).render("pages/_404");
  }
});


/***
 * Forms
 * & E-Mails
 */
app.post('/send', (req, res) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  console.log("form sent")


  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587
    ,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'email@project-name.com', // generated ethereal user
      pass: 'XXXXXXXXXXXXX'  // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Media Creators Studio" <info@project-name.com>', // sender address
    to: `${req.body.email}, info@project-name.com`, // list of receivers
    bcc: 'bcc@project-name.com', // list of receivers
    subject: 'New Contact Message', // Subject line
    text: 'Hello world?', // plain text body
    html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    res.render('pages/email_sent', {
      msg: 'Email has been sent',
      output
    });
  });
});


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
