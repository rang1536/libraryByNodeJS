module.exports = function(){
  var express = require('express');
  var route = express.Router();
  var mysql = require('mysql');
  var conn = mysql.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password : 'java0000',
    database : 'library22'
  });

  // GET요청 로그아웃처리
  route.get('/logout', function(req, res){
    delete req.session.level;
    res.redirect('/home');
  });
  // POST요청 로그인처리
  route.post('/login', function(req, res){
    var id = req.body.adminId;
    var pw = req.body.adminPw;
    var sql = 'SELECT * FROM admin WHERE adminid=?';
    conn.query(sql, [id], function(err, result){
      console.log(result[0].adminpw);
      if(err){
        res.send('로그인체크에러!'+err);
      }else if(result[0].adminpw){
        if(result[0].adminpw == pw){
          req.session.level = 'admin';
          res.redirect('/home');
        }else{
          res.send('비밀번호가 일치하지않습니다.<br/><br/><a href="/home">HOME</a>')
        }
      }else{
        res.send('아이디가 일치하지않습니다.<br/><br/><a href="/home">HOME</a>');
      }
    });
  });
  return route;
}
