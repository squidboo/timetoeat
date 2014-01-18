
/*
 * POST /new
 */

exports.new = function(req, res){
  require('crypto').randomBytes(6, function(ex, buf) {
    token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
    foodlists = GLOBAL.nano.db.use('foodlists');
    foodlists.insert({ list: token }, token, function(err, body) {
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
  res.render('list', { title: 'My list ' + req.params.list });
};