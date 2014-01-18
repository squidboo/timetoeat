
/*
 * POST /new
 */

exports.new = function(req, res){
  res.redirect('/mylist');
};

/*
 * GET list
 */

exports.show = function(req, res){
  res.render('list', { title: 'My list' });
};