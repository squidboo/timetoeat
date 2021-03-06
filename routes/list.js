
/*
 * POST /new
 */

exports.new = function(req, res){
  require('crypto').randomBytes(6, function(ex, buf) {
    token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
    foodlists = GLOBAL.nano.db.use('foodlists');
    foodlists.insert({ list: token, title: req.body.lstitle }, token, function(err, body) {
      if (err) {
        console.log('[foodlists.insert] ', err.message);
        return;
      }
      res.redirect(token);
    });
  });
};

/*
 * GET list
 */

exports.show = function(req, res){
  foodlists = GLOBAL.nano.db.use('foodlists');
  fooddb = GLOBAL.nano.db.use('food');
  foodlists.get(req.params.list, {}, function(err, body) {
    if (err) {
      console.log('[foodlists.get] ', err.message);
      return;
    }
    title = body.title;
    fooddb.view('food', 'by_list', { keys: [req.params.list] }, function(err, body) {
      if (err) {
        console.log('[food/by_list] ', err.message);
        return;
      }
      food = {};
      moment = require('moment');
      body.rows.sort(function (a,b) {
        return a.value.useby.localeCompare(b.value.useby);
      }).forEach(function (doc) {
        eatby = doc.value.useby;
        today = moment().format('YYYY-MM-DD');
        tomorrow = moment().add('days', 1).format('YYYY-MM-DD');
        endOfWeek = moment().add('weeks', 1).format('YYYY-MM-DD');
        nextWeek = moment().add('weeks', 2).format('YYYY-MM-DD');
        category = '';
        if (eatby < today) {
          category = 'Past Its Best';
        } else if (eatby == today) {
          category = 'Today';
        } else if (eatby == tomorrow) {
          category = 'Tomorrow';
        } else if (eatby < endOfWeek) {
          category = moment(eatby).format('dddd');
        } else if (eatby < nextWeek) {
          category = 'Next Week';
        } else {
          category = 'Future';
        }
        if (!food[category]) {
          food[category] = [];
        }
        doc.value.formattedUseby = moment(eatby).format('ll');
        food[category].push(doc);
      });
      res.render('list', { title: title, food: food });
    });
  });
};

/*
 * POST /food
 */

exports.add_food = function(req, res){
  fooddb = GLOBAL.nano.db.use('food');
  if (req.body.newfood) {
    fooddb.insert({ list: req.params.list, name: req.body.newfood, useby: req.body.eatby, status: 'stored' }, {}, function(err, body) {
      if (err) {
        console.log('[food.insert] ', err.message);
        return;
      }
      res.redirect('/' + req.params.list);
    });
  } else {
    fooddb.get(req.body._id, function(err, body) {
      if (err) {
        console.log('[food.get] ', err.message);
        return;
      }
      food = body;
      if (req.body.tasted === '') {
        food.status = 'tasted';
      } else {
        food.status = 'wasted';
      }
      fooddb.insert(food, food._id, function(err, body) {
        if (err) {
          console.log('[food.update] ', err.message);
          return;
        }
        res.redirect('/' + req.params.list);
      });
    });
  }
};

/*
 * GET list statistics
 */

exports.statistics = function(req, res){
  foodlists = GLOBAL.nano.db.use('foodlists');
  fooddb = GLOBAL.nano.db.use('food');
  foodlists.get(req.params.list, {}, function(err, body) {
    if (err) {
      console.log('[foodlists.get] ', err.message);
      return;
    }
    title = body.title;
    fooddb.view('wasted', 'by_list', { keys: [req.params.list] }, function(err, body) {
      if (err) {
        console.log('[wasted/by_list] ', err.message);
        return;
      }
      food = {};
      moment = require('moment');
      body.rows.sort(function (a,b) {
        return a.value.useby.localeCompare(b.value.useby);
      }).forEach(function (doc) {
        eatby = doc.value.useby;
        if (!food[eatby]) {
          food[eatby] = [];
        }
        food[eatby].push(doc);
      });
      res.render('statistics', { title: title, food: food });
    });
  });
};
