
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
      body.rows.forEach(function (doc) {
        eatby = doc.value.useby;
        today = moment().format('YYYY-MM-DD');
        tomorrow = moment().add('days', 1).format('YYYY-MM-DD');
        category = '';
        if (eatby < today) {
          category = 'Past Its Best';
        } else if (eatby == today) {
          category = 'Today';
        } else if (eatby == tomorrow) {
          category = 'Tomorrow';
        } else {
          category = 'Future';
        }
        if (!food[category]) {
          food[category] = [];
        }
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