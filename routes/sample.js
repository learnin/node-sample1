
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('sample', { title: 'sample' })
};