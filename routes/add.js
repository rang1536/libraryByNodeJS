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
    
  // get요청 view로 랜더링(도서,회원,대여,관리자등록폼).
  route.get('/:id',function(req,res){
    var id = req.params.id;
    var sql = 'SELECT * FROM library';
    conn.query(sql,function(err, libraryResult){
      if(err){
        res.send("System Error2!")
      } else {
        if(id === 'books'){
          sql = 'SELECT * FROM bookskinds';
          conn.query(sql, function(err, kindsresult){
            if(err){
              res.send("System Error1!")
            } else {
              res.render(id+'AddForm',{booksKinds:kindsresult, libResult:libraryResult});
            }
          });
        } else if(id === 'member'){
          sql = 'SELECT * FROM local'
          conn.query(sql, function(err, localResult){
            if(err){
              res.send("System Error1!")
            } else {
              res.render(id+'AddForm',{local:localResult, libResult:libraryResult});
            }
          });
        } else if(id === 'rentAdd'){
          res.render('rentAdd');
        } else if(id === 'admin'){
          res.render(id+'AddForm', {libResult:libraryResult});
        }
      }
    });
  });
  //post요청처리(도서등록,회원등록)
  route.post('/:id',function(req, res){
    var level = req.session.level;
    console.log(level);
    var libNum = req.body.libraryCode;
    var sql = 'SELECT localnumber FROM library WHERE librarynumber=?';
    var localNum ='';
    // 지역번호 구하기
    conn.query(sql,[libNum], function(err, localNum){
      if(err){
        res.send('localNum : '+err);
      }else {
        console.log(localNum[0].localnumber);
        //id값 가져와서 books요청이면 도서등록 실시.
        var id=req.params.id;
        if(id==='books'){
          var sql =' INSERT INTO books(bookskindsnumber,'
            +'localnumber,librarynumber,booksname,booksmade,booksauthor,'
            +'bookslendingpossible,bookslendingcount,bookslendingday,booksdamage) '
            +'VALUES(?,?,?,?,?,?,?,?,?,?)';
          var stateMent = [
            req.body.booksCategory, localNum[0].localnumber, req.body.libraryCode, req.body.booksName,
            req.body.bookCompany,req.body.booksWriter, req.body.rentCan, req.body.rentCount,
            req.body.rentDaily, req.body.booksDamage];
          conn.query(sql, stateMent, function(err, result){
            if(err){
              res.send(err);
            }else{
              res.redirect('/home');
            }
          });
        }else if(id==='members'){
          var sql = 'INSERT INTO members'+
            '(localnumber,librarynumber,membername,membertel,memberaddr,memberrrn,membervip)'+
            ' VALUES(?,?,?,?,?,?,?)';
          var rrn = req.body.socialNum + req.body.socialBackNum ;
          var statement = [
            localNum[0].localnumber,req.body.libraryCode, req.body.memberName,
            req.body.memberMobile, req.body.memberAdd,rrn, req.body.memberVip];
          conn.query(sql, statement, function(err, result){
            if(err){
              res.send('회원등록실패'+err);
            }else{
              res.redirect('/home');
            }
          });
        }else if(id==='admin'){
          var sql = 'INSERT INTO admin'+
            '(adminid,librarynumber,localnumber,adminpw,adminname,adminrrn,adminaddr,admintel)'+
            ' VALUES(?,?,?,?,?,?,?,?)';
          var rrn = req.body.socialNum + req.body.socialBackNum ;
          var statement = [
            req.body.adminId, req.body.libraryCode, localNum[0].localnumber,
            req.body.adminPassword, req.body.adminName, rrn, req.body.adminAdd,
            req.body.adminMobile];
          conn.query(sql, statement, function(err,result){
            if(err){
              res.send('관리자등록실패'+err);
            }else{
              res.redirect('/home');
            }
          });
        }
      }
    });
  });
  return route;
};
