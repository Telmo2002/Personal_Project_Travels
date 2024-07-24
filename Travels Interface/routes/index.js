// 

var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  const filePath = path.join(__dirname, '../views', 'index.html');
  console.log('Serving file:', filePath);
  res.sendFile(filePath, function(err) {
    if (err) {
      console.log('Error sending file:', err);
      next(err);
    }
  });
});

router.get('/create-task', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'create-task.html'));
});

/* POST submit task. */
router.post('/submit-task', function(req, res, next) {
  // Handle form submission here
  console.log('Task Name:', req.body.taskName);
  console.log('Task Description:', req.body.taskDescription);
  console.log('Quantia:', req.body.taskDescription)
  console.log('', req.body.taskDescription)

  // Redirect or respond to the user
  res.redirect('/');
});

module.exports = router;
