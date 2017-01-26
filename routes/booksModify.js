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

  //get요청 도서정보 수정처리
  route.get('/:id', function(req, res){
    var id = req.params.id;
    var sql = 'SELECT books.*, bookskinds.bookskindname, library.libraryname'
      +' FROM books'
      +' LEFT JOIN bookskinds'
      +' ON books.bookskindsnumber = bookskinds.bookskindnumber'
      +' LEFT JOIN library'
      +' ON books.librarynumber = library.librarynumber'
      +' WHERE booksnumber = ?';
    conn.query(sql,[id],function(err, result){
      if(err){
        res.send('modify!'+err);
      }else{
        console.log(result);
        sql = 'SELECT * FROM bookskinds';
        conn.query(sql,function(err,kinds){
          if(err){
            res.send('modify!'+err);
          }else{
            sql= 'SELECT * FROM library';
            conn.query(sql, function(err,lib){
              if(err){
                res.send('modify!'+err);
              }else{
                res.render('booksModify',{books:result, booksKinds:kinds, libResult:lib});
              }
            });
          }
        });
      }
    });
  });
  //post요청 도서정보수정처리
  route.post('/:id', function(req, res){
    var libNum = req.body.libraryCode;
    var sql = 'SELECT localnumber FROM library WHERE librarynumber=?';
    var localNum ='';
    // 지역번호 구하기
    conn.query(sql,[libNum], function(err, localNum){
      if(err){
        res.send('localNum : '+err);
      }else {
        console.log(localNum[0].localnumber);
        var sql = 'UPDATE books SET bookskindsnumber=?,'
          +'localnumber=?,librarynumber=?,booksname=?,booksmade=?,booksauthor=?,'
          +'bookslendingpossible=?,bookslendingcount=?,bookslendingday=?,booksdamage=?'
          +' WHERE booksnumber=?';
        var statement = [
          req.body.booksCategory, localNum[0].localnumber, req.body.libraryCode, req.body.booksName,
          req.body.bookCompany,req.body.booksWriter, req.body.rentCan, req.body.rentCount,
          req.body.rentDaily, req.body.booksDamage, req.body.booksnumber];
        console.log(statement);
        conn.query(sql, statement, function(err, result){
          if(err){
            res.send('books Infomation update Error!!')
          }else{
            res.redirect('/list/books')
          };
        });
      };
    });
  });
  return route;
};
