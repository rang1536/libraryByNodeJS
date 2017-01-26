module.exports = function(){
  var express= require('express');
  var route = express.Router();
  var mysql = require('mysql');
  var conn = mysql.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password : 'java0000',
    database : 'library22'
  });

  //get요청 리스트-도서목록,대출가능목록
  route.get('/:id', function(req, res){
    var id = req.params.id;
    if(id === 'books'){
      var sql = 'SELECT * FROM books';
      conn.query(sql, function(err, result){
        if(err){
          res.send('list Error : '+ err);
        }else{
          res.render('booksList',{booksList:result});
        }
      });
    }else if(id === 'rentCan'){
      var sql = 'SELECT * FROM books WHERE bookslendingpossible=1'
      conn.query(sql, function(err, rentCanList){
        if(err){
          res.send('대출가능리스트 조회 오류!!')
        }else{
          res.render('booksList',{booksList:rentCanList});
        }
      });
    }
  });
  return route;
};
