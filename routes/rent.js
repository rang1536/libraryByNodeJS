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

  //post요청 대여등록,트랜잭션필요!!, rentback값이 0일때 대여시작,반납시 1로 수정.
  route.post('/books',function(req, res){
    var statement = [
      req.body.booksNumber, req.body.membernumber, req.body.startDay,
      req.body.endDay, req.body.rentPay, req.body.booksDamage, '0'];
    var sql = 'INSERT INTO booksrent('+
      'booksnumber, membernumber, startday, endday, rentpay, damage, rentback)'+
      ' VALUES(?,?,?,?,?,?,?)';
    conn.query(sql, statement, function(err, result){
      if(err){
        console.log(err);
        res.send('대여등록 에러!!다시 확인하세요!');
      }else{
        sql = 'SELECT firstrent FROM books WHERE booksnumber=?'
        conn.query(sql, [req.body.booksNumber], function(err,result){
          if(err){
            console.log(err);
            res.send('error!!')
          }else if(result[0].firstrent == null){
            sql = 'UPDATE books SET firstrent=? WHERE booksnumber=?'
            conn.query(sql,[req.body.startDay,req.body.booksNumber],function(err,result){
              if(err){
                console.log(err);
                res.send('최초대여일 등록실패!');
              }else{
                res.redirect('/home');
              }
            });
          }else{
            res.redirect('/home');
          }
        });
      }
    });
  });
  //get요청 반납처리-리스트연결
  route.get('/rentList', function(req, res){
    var sql = 'SELECT booksrent.*, members.membername, books.booksname'+
      ' FROM booksrent LEFT JOIN members'+
      ' ON booksrent.membernumber = members.membernumber'+
      ' LEFT JOIN books'+
      ' ON booksrent.booksnumber = books.booksnumber'+
      ' WHERE booksrent.rentback = "0"';
    conn.query(sql, function(err,rentList){
      if(err){
        console.log(err);
        res.send('반납처리 에러~!!');
      }else{
        res.render('rentList',{rentList:rentList});
      }
    });
  });
  //get요청 반납처리-대여정보수정(view로 연결).
  route.get('/:id', function(req, res){
    var id = parseInt(req.params.id);
    var sql = 'SELECT * FROM booksrent WHERE booksrentnumber = ?';
    conn.query(sql, id, function(err, rentList){
      if(err){
        consloe.log(err);
        res.send('대여정보 불러오기 에러!!');
      }else{
        res.render('rentModify',{rentList:rentList});
      }
    });
  });
  //post요청 반납처리--대여정보수정,대여일수,파손등 도서정보수정.트랜잭션필요.
  route.post('/modify', function(req, res){
    var statement = [
      req.body.endDay, req.body.rentPay,req.body.booksDamage,
      req.body.totalRentDay, '1', req.body.booksRentNumber];
    var sql = 'UPDATE booksrent SET endday=?, rentpay=?, damage=?, totalrentday=?,'+
      ' rentback=? WHERE booksrentnumber=?';
    conn.query(sql, statement, function(err, result){
      if(err){
        console.log(err);
        res.send('반납정보등록 실패!')
      }else{
        sql = 'SELECT * FROM books WHERE booksnumber=?';
        conn.query(sql, [req.body.booksNumber], function(err, bookResult){
          if(err){
            console.log(err);
            res.send("반납처리 도서정보 불러오기 실패!");
          }else if(req.body.booksDamage === '0'){ //파손되지않았을때
            sql = 'UPDATE books '+
              'SET bookslendingpossible=?, bookslendingcount=?, bookslendingday=?'+
              ' WHERE booksnumber = ?';
            var totalCount = bookResult[0].bookslendingcount + 1;
            var totalrentDay = bookResult[0].bookslendingday + parseInt(req.body.totalRentDay);
            statement = ['1', totalCount, totalrentDay, req.body.booksNumber];
            conn.query(sql, statement, function(err, result){
              if(err){
                res.send('반납-도서정보 수정처리 실패');
              }else{
                res.redirect('/home');
              }
            });
          }else if(req.body.booksDamage == '1'){ //파손되었을때
            sql = 'UPDATE books '+
              'SET bookslendingpossible=?, bookslendingcount=?, bookslendingday=?, '+
              'booksdamage=?, booksdamagedate=? WHERE booksnumber = ?';
            var totalCount = bookResult[0].bookslendingcount + 1;
            var totalrentDay = bookResult[0].bookslendingday + parseInt(req.body.totalRentDay);
            console.log(totalCount,totalrentDay);
            statement = [
              '1', totalCount, totalrentDay, '1', req.body.damageDay, req.body.booksNumber];
            conn.query(sql, statement, function(err, result){
              if(err){
                console.log(err);
                res.send('반납-도서정보 수정처리 실패');
              }else{
                res.redirect('/home');
              }
            });
          }
        });
      }
    });
  });

  return route;
};
