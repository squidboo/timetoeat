
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Time to Eat' });
};
exports.about = function(req, res){
  res.render('about', { title: 'About Time to Eat' });
};