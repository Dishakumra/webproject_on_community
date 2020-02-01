var userid=document.getElementById("user");
var password=document.getElementById("password");
var login=document.getElementById("login");
login.addEventListener("click",function(abc)
{
  console.log("lll");
  var users=[];
  var xttp=new XMLHttpRequest();
  xttp.addEventListener('load',function()
{
  console.log(xttp.responseText);
//  var f=JSON.parse(xttp.responseText);
  if(xttp.responseText=="yes")
  {
    alert("yes");
    var    xhttp=new XMLHttpRequest();
    xhttp.open("POST",'/findUser')
    xhttp.setRequestHeader("content-type","application/json");
xhttp.send(JSON.stringify({"email":user.value}));
    xhttp.onreadystatechange=function(){
         if (this.readyState == 4 && this.status == 200){
             users=JSON.parse(this.responseText);
console.log(users);

                    window.location.href=`/1/${users[0]._id}`;


         }
//
    };


}
else if(xttp.responseText=="UPDATE")
{
  alert("yes");
  var    xhttp=new XMLHttpRequest();
  xhttp.open("POST",'/findUser')
  xhttp.setRequestHeader("content-type","application/json");
xhttp.send(JSON.stringify({"email":user.value}));
  xhttp.onreadystatechange=function(){
       if (this.readyState == 4 && this.status == 200){
           users=JSON.parse(this.responseText);
//console.log(users);

          window.location.href=`/edit-profile/${users[0]._id}`;


       }
         };

}
  else {
      alert("NOT A VALID INPUT");

  }
});
  xttp.open("POST",'/check');
  xttp.setRequestHeader("Content-Type",'application/json');
  xttp.send(JSON.stringify({'userid':userid.value,'password':password.value}));
})
