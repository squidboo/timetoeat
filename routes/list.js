
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
  foodlists.get(req.params.list, {}, function(err, body) {
    if (err) {
      console.log('[foodlists.get] ', err.message);
      return;
    }    
    res.render('list', { title: body.title });
  });
};

/*
 * POST /food
 */

exports.add_food = function(req, res){
  food = GLOBAL.nano.db.use('food');
  food.insert({ list: req.params.list, name: req.body.newfood, useby: req.body.eatby, status: 'stored' }, {}, function(err, body) {
    if (err) {
      console.log('[food.insert] ', err.message);
      return;
    }
    res.redirect('/' + req.params.list);
  });
};