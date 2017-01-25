var express = require('express');
var mysql = require('mysql');
var conn = mysql.createConnection({
  host : '127.0.0.1',
  user : 'root',
  password : 'java0000',
  database : 'library22'
});
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');
app.use(session({
  secret: 'H!@OJ$#ISNC@JRGO$J!@#',
  resave: false,
  saveUninitialized: true,
}));
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(__dirname+'/public'));
app.use(function(req, res, next){
  res.locals.user = req.session.level;
  next();
});
app.set('view engine', 'ejs');
app.set('views','./views');

conn.connect();

app.get('/home',function(req,res){
  res.render('booksHome');
});
// GET요청 로그아웃처리
app.get('/admin/logout', function(req, res){
  delete req.session.level;
  res.redirect('/home');
});
// POST요청 로그인처리
app.post('/admin/login', function(req, res){
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
// get요청 view로 랜더링(도서,회원,대여,관리자등록폼).
app.get('/add/:id',function(req,res){
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
app.post('/add/:id',function(req, res){
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
//post요청 대여등록,트랜잭션필요!!
app.post('/rent/books',function(req, res){
  var statement = [
    req.body.booksNumber, req.body.membernumber, req.body.startDay,
    req.body.endDay, req.body.rentPay, req.body.booksDamage, '1'];
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
app.get('/rent/rentList', function(req, res){
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
app.get('/rent/:id', function(req, res){
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
app.post('/rent/modify', function(req, res){
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
//post요청 도서정보수정처리
app.post('/modify/:id', function(req, res){
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
//get요청 도서정보 수정처리
app.get('/modify/:id', function(req, res){
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
//get요청 리스트-도서목록,대출가능목록
app.get('/list/:id', function(req, res){
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

app.listen(3000,function(){
  console.log('Connected 3000port!');
});
