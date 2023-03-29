var express = require('express');
var router = express.Router();
const { Client } = require('pg');
var dbConf = require('../config/db');
var multer = require('multer');
var fs   = require('fs');

const sgMail = require('@sendgrid/mail');

const client = new Client(dbConf)
client.connect()


sgMail.setApiKey('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');



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ''))
  }
})
var upload = multer({ storage: storage })


/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    result = await client.query('SELECT * FROM categories;');
    const categories = result.rows;
    result = await client.query('SELECT * FROM faqs;');
    faqs = {};

    for (category of categories) {
      f = result.rows.filter(faq => faq.categoryid == category.id);
      faqs[category.id] = (f);
    }
    res.render('index', {
      categories,
      faqs
    });
  } catch (err) {
    console.log(err);
    res.render('500');
  }
});


router.get('/faqs', async function (req, res, next) {
  try {
    result = await client.query('SELECT * FROM faqs;');
    res.json(result.rows);
  } catch (error) {
    res.statusCode(500);
  }
});

router.post('/mail', upload.single('file'), async function (req, res, next) {
  try {
    attachment = undefined;

    if (req.file) {
      attachments = [{ //1572803767775-e.jpg
        content: fs.readFileSync('public/uploads/'+ req.file.filename).toString('base64'),
        filename: req.file.filename,
        type: req.file.mimetype, //'plain/text'
        disposition: 'attachment',
        contentId: 'attachedFile'
      }];
    }

    // /uploads/${req.file.filename} changeg to base64
    const msg = {
      to: 'hamzatrq116@gmail.com',
      from: req.body.email,
      subject: 'Request from website',
      text: `
      Name: ${req.body.name}
      ${req.body.request}`,
      attachments,
    };
    await sgMail.send(msg);
    res.redirect('/')
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});


module.exports = router;
