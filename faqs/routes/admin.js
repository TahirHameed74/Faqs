var express = require('express');
var multer = require('multer');


var router = express.Router();

const { Client } = require('pg')
var dbConf = require('../config/db');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ''))
  }
})
var upload = multer({ storage: storage })


const client = new Client(dbConf);
client.connect()


router.use(function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/auth/login');
  } else {
    next();
  }
});

/* GET home page. */
router.get('/', async function (req, res, next) {
  console.log('User: ', req.user);
  try {
    result = await client.query('SELECT * FROM categories;');
    const categories = result.rows;
    result = await client.query('SELECT * FROM faqs;');
    faqs = {};

    for (category of categories) {
      f = result.rows.filter(faq => faq.categoryid == category.id);
      faqs[category.id] = (f);
    }
    res.render('faqs', {
      faqs,
      categories
    });
  } catch (err) {
    console.log(err);
    res.render('500');
  }
});

router.get('/new-category', function (req, res, next) {
  res.render('category-new', { error: req.flash('error') });
});

router.post('/new-category', async function (req, res, next) {
  const { title, icon } = req.body;

  if (title.trim().length == 0 || icon.trim().length == 0) {
    return res.redirect('/admin/new-category');
  }

  try {
    result = await client.query(`SELECT * FROM categories WHERE title='${title}'`);
    if (result.rows.length > 0) {
      req.flash('error', 'Category already exists');
      return res.redirect('/admin/new-category');
    }
  } catch (err) {
    console.log(err);
    return res.render('500');
  }

  try {
    await client.query(`INSERT INTO categories (icon, title) VALUES ('${icon}', '${title}');`);
    return res.redirect('/admin/');
  } catch (err) {
    console.log(err);
    return res.render('500');
  }
});

router.get('/category/:id/edit', async function (req, res, next) {
  id = Number.parseInt(req.params.id);
  category = (await client.query(`SELECT * FROM categories WHERE id=${id};`)).rows[0];
  if (!category) {
    return res.redirect('/admin/');
  }
  res.render('category-edit', { category, error: req.flash('error') });
});


router.post('/category/:id/edit', async function (req, res, next) {
  id = Number.parseInt(req.params.id);
  const { title, icon } = req.body;
  try {
    await client.query(`
      UPDATE categories 
      SET 
        title = '${title}',
        icon = '${icon}'
      WHERE
          id = ${id};
    `);
    return res.redirect('/admin/');
  } catch (error) {
    console.log(error);
    req.flash('error', 'Something went wrong');
    res.redirect(`/admin/category/${id}/edit`);
  }
});


router.get('/category/:id/delete', async function (req, res, next) {
  id = Number.parseInt(req.params.id);
  try {
    await client.query(`
      DELETE FROM categories
      WHERE
          id = ${id};
    `);
  } catch (error) {
    console.log(error);
  }
  return res.redirect('/admin/');
});


router.get('/faq/:id/edit', async function (req, res, next) {
  id = Number.parseInt(req.params.id);
  faq = (await client.query(`SELECT * FROM faqs WHERE id=${id};`)).rows[0];
  categories = (await client.query(`SELECT * FROM categories;`)).rows;
  if (!faq) {
    return res.redirect('/admin/');
  }

  if (faq.answer.includes('<video')) {
    res.render('faq-edit-video', { faq, categories, error: req.flash('error') });
  } else {
    res.render('faq-edit', { faq, categories, error: req.flash('error') });
  }
});

router.post('/faq/:id/edit', async function (req, res, next) {
  const { category, question, answer } = req.body;
  console.log('Got', category);
  try {
    await client.query(`
      UPDATE faqs 
      SET 
        question = '${question}',
        answer = '${answer}',
        categoryID = ${category}
      WHERE
          id=${req.params.id};
    `);

    return res.redirect('/admin/');
  } catch (err) {
    console.log(err);
    res.render('500');
  }
});


router.get('/faq/:id/delete', async function (req, res, next) {
  id = Number.parseInt(req.params.id);
  try {
    await client.query(`
      DELETE FROM faqs
      WHERE
          id = ${id};
    `);
    return res.redirect('/admin/');
  } catch (error) {
    console.log(error);
    req.flash('error', 'Something went wrong');
    res.redirect(`/admin/`);
  }
});


router.get('/new-video', async function (req, res, next) {
  try {
    categories = (await client.query('SELECT * FROM categories;')).rows;
    res.render('faq-new-video', {
      categories
    });
  } catch (err) {
    console.log(err);
    res.render('500');
  }
})

router.post('/new-video', upload.single('video'), async function (req, res, next) {
  const { category, question } = req.body;

  if (!req.file) {
    res.redirect('/admin/new-video');
  }

  const answer = `
  <video width="400" controls>
  <source src="/uploads/${req.file.filename}"
      type="${req.file.mimetype}">
  </video>
  `;
  try {
    await client.query(`INSERT INTO faqs (question, answer, categoryid) VALUES ('${question}', '${answer}', ${Number.parseInt(category)});`);
    return res.redirect('/admin/');
  } catch (err) {
    console.log(err);
    res.render('500');
  }
});


router.post('/faq/:id/edit-video', upload.single('video'), async function (req, res, next) {
  const { category, question } = req.body;

  if (!req.file) {
    res.redirect('/admin/new-video');
  }

  const answer = `
  <video width="400" controls>
  <source src="/uploads/${req.file.filename}"
      type="${req.file.mimetype}">
  </video>
  `;
  try {
    await client.query(`UPDATE faqs SET question='${question}', answer='${answer}', categoryid=${category} WHERE id=${req.params.id};`);
    return res.redirect('/admin/');
  } catch (err) {
    console.log(err);
    res.render('500');
  }
});




router.get('/new', async function (req, res, next) {
  try {
    categories = (await client.query('SELECT * FROM categories;')).rows;
    res.render('faq-new', {
      categories
    });
  } catch (err) {
    console.log(err);
    res.render('500');
  }
});

router.post('/new', async function (req, res, next) {
  const { category, question, answer } = req.body;
  try {
    await client.query(`INSERT INTO faqs (question, answer, categoryid) VALUES ('${question}', '${answer}', ${Number.parseInt(category)});`);
    return res.redirect('/admin/');
  } catch (err) {
    console.log(err);
    res.render('500');
  }
});


module.exports = router;
