let ID;
let url = "http://localhost:3000/expense";
let url2 = "http://localhost:3000/purchase";
let url3 = "http://localhost:3000/premium";
let url4 = "http://localhost:3000/updateexpense";
const token = localStorage.getItem('token');

const balance = document.getElementById("balance");
const money_plus=document.getElementById('money-plus');
const money_minus=document.getElementById('money-minus');

const list=document.getElementById("list");
const form=document.getElementById('form');
let text=document.getElementById('text');
let amount=document.getElementById('amount');
let category=document.getElementById('category');


form.addEventListener('submit',addTransaction);

let downloading = document.getElementById('downloadexpense');
let oldfiledownloading = document.getElementById('oldfilesdownload');

function editid(id){  
    ID=id;
}

// Add transaction by clicking on button submitting
async function addTransaction(e){           //////first on submit it comes here
    try{
        e.preventDefault();
        if(text.value.trim() === "" || amount.value.trim() === "")
        {
         alert('Please Enter the Complete Details First');
        }
        else{
          let transaction = {     ////we created object
            text:text.value,
            amount: +amount.value, //use + to change its type from string to number or int
            category: category.value,
            //userId: 1   //now will no see in payload any userId  //but it will be null if u see expense table
           };

           console.log(ID);
            if(ID){  //this id is passing is for Edit purpose and then will submit
                console.log(ID);
                // let res =  await axios.put(url+'/'+ID,transaction)
                try{
                    let res= await axios.put(`${url}/edit-expense/${ID}`,transaction, { headers: {'Authorization' : token}})
                    const obj = res.config.data;   //in update it present in config 
                    console.log(obj);
                    const parRes = JSON.parse(obj);
                    const sepid = {id:parseInt(`${ID}`)};
                    const last = {...sepid,...parRes};
                    console.log(last);
                    // console.log(parRes);
                    onScreenAfterEdit(last);  
                }catch(err){
                    console.log(err);
                    }
            }
            
           else{    //ID is now undefined
                let res=await axios.post(`${url}/add-expense`, transaction ,{ headers: {'Authorization' : token}}) //on submit new and fresh form post request will be sent
                try{
                    console.log(res.data.data);
                    //console.log(res.data.expense);
                    onScreen(res.data.data);
                    document.getElementById('text').value="";
                    document.getElementById('amount').value="";
                    document.getElementById('category').value="";
                }catch(err){
                    console.log(err,"not able to do post here in index.js");
                }
            }
         }
     }
     catch(err){
        console.log(err);
      }
}


window.addEventListener('DOMContentLoaded',onload);
function onload(e)
{
    console.log(token);
    if(token != ""){
        const decodeToken = parseJwt(token);
        console.log(decodeToken);
        // const isadmin = localStorage.getItem('isadmin');
        let isadmin = decodeToken.ispremiumuser   //if you saw jwt.io there an option ispremiumuser so it means whatever token we have it also contains the key ispremiumuser so this will get true that we set in options handlers ispremium we are getting we set jwt .sign in backen and we see it in console.log
        console.log(isadmin);
        if(isadmin){
         showPremiumuser();
         showLeaderboard();
         downloading.style.visibility = "visible";
         oldfiledownloading.style.visibility = "visible";
        }
        const page = 1;
        getExpense(page);
    }
    else{
        window.location.href = "../index.html";
    }
    
}

function getter() {   ////when click on get button which finction onclick already mention in html file we have to set dynamically how many items user want on the first page pagination 
    localStorage.setItem("count", document.getElementById("NumberofRecords").value)
    location.reload();   ////screen reloaded automaticalSly we dont need to click on reload button
}

async function getExpense(page){

        document.getElementById("list").innerHTML = "";  /////if go to next page we have to empty the list so that we can fill later expenses in the list otherwise append on the previous ones
        const COUNT = localStorage.getItem("count");
        const database = await axios.get(`${url}/get-expense?page=${page}&count=${COUNT}`, { headers : {"Authorization": token}})
        .then(response => {
            console.log(response.data.rows.length);
            sendToUi(response.data.rows);
           //////after we got the data  from database from backend to know about next,previos ,hasnext, has previous we will send to the function showPagination (currentbutton, next button, prev button)
           if(response.data.rows.length){
            showPagination(response.data);
           }
              
        })
        .catch(err => console.log(err));
    //    console.log(database);
        return database       /////this will return to showPagination await getExpense
        //console.log(database.data)
  
}

async function sendToUi(obj) {

    console.log(obj);
    // if (obj.length == 0) {
    //     document.getElementById("puser").innerHTML ="<br> No Transactions to show"
    // }
    for (let i = 0; i < obj.length; i++) {
        console.log(obj[i]);
        onScreen(obj[i]);
        // console.log(dbData[i]);
    }
}

function onScreen(transaction){
    console.log(transaction);
    // const transaction = details.data;
    // console.log(transaction);
    const sign = transaction.amount < 0 ? "-":"+";
    let item = document.createElement("li");
    item.classList.add(transaction.amount < 0 ? "minus" : "plus"  );
    //item.setAttribute("class", classname);
    item.setAttribute("id", transaction._id);
    let classname = transaction.amount < 0 ? "Expense" : "Income"
    item.innerHTML =  `Description : ${transaction.text}
                       <span>Category : ${transaction.category}</span>
                       <span>Amount ${classname} : ${sign}${Math.abs(transaction.amount)}</span>
                       <button class="edit-btn" onclick="editData('${transaction._id}','${transaction.text}','${transaction.amount}','${transaction.category}')">EDIT</button>
                       <button class="delete-btn" onclick="removeTransaction('${transaction._id}')">X</button>
                       `;
    
    list.appendChild(item);
    updateValues();
}

////Pagination /////
async function showPagination({
    currentpage,
    hasnextpage,
    nextpage,
    haspreviouspage,
    previouspage,
    lastpage
}){
    
    const pagination = document.getElementById('pagination');    //// to addd curent pagge and previous next button
    pagination.innerHTML = '';
    if(haspreviouspage){            ////if true whcih we will get from backend means hasPrevious page means not at the starting 1 but somewhere from 2-n
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = `<li class="page-item"><a class="page-link">Previous page</a></li>`;
        prevBtn.addEventListener('click', async() => { 
            await getExpense(previouspage) 
        })
        pagination.appendChild(prevBtn)
        //pagination.append(" ")  to just give some space between prev and curre
    }

    const currbtn = document.createElement('button');
    currbtn.innerHTML =  `<li class="page-item"><a class="page-link">${currentpage}</a></li>`
    currbtn.addEventListener('click', () => {
        if (currentpage == lastpage) {
            getExpense(1)
        }
    })
    pagination.appendChild(currbtn)
    //pagination.append(" ")

    if (hasnextpage) {
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = `<li class="page-item"><a class="page-link">Next Page</a></li>`;    ///when 
        nextBtn.addEventListener('click', async() => { 
            await getExpense(nextpage) 
        })
        pagination.appendChild(nextBtn)
    }

}



function showLeaderboard(){
    const inputElement = document.createElement("input");
    inputElement.type = 'button';
    inputElement.value = 'Show Leaderboard';
    inputElement.classList.add("btn");
   
    let ct =0 ;

    inputElement.onclick = async() => {
        if(ct == 0){
            ct+=1;
            const LeaderboardArray = await axios.get(`${url3}/showLeaderBoard`, { headers: { 'Authorization':token }});
            console.log(LeaderboardArray);
    
            let leaderboardElem = document.getElementById('leaderboard');
            leaderboardElem.innerHTML+= '<h1>Leader Board</h1>';
    
            LeaderboardArray.data.forEach((userDetails) => {
                console.log(userDetails);
                leaderboardElem.innerHTML+= `<li>Name:${userDetails.name} Total Balance Money:${userDetails.totalBalance}</li>` 
    
            })
        }  
    }
    document.getElementById('message').append(inputElement);
}

function showPremiumuser() {
    document.getElementById('rzp-button').style.visibility = 'hidden';
    document.getElementById('message').innerHTML = `<h1>You are a premium user</h1>`;
}

function parseJwt (token) {   
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

document.getElementById('rzp-button').onclick = async function(e) {
   const response = await axios.get(`${url2}/premiummembership`, {headers: {'Authorization': token}});
   console.log(response);// from backend created order we get data in res now move to the payment in options
   
   let options = {
    "key": response.data.key_id, //entert the key id which was generated from razorpay dashboard
    "order_id": response.data.order._id,  
    "handler": async function(response) {    //It's a callback function whenever payment is successful
        const res = await axios.post(`${url2}/updatetransaction`, {  //this will call the backend and update the token
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
        }, {headers: {'Authorization': token}})   
       console.log(res);
        alert('You are a Premium User Now')
        console.log(res.data.token);
        localStorage.setItem('token',res.data.token);   
    //    localStorage.setItem('isadmin',true);
       const decodeToken = parseJwt(token);
       console.log(decodeToken);
       document.getElementById('rzp-button').style.visibility = 'hidden';
       document.getElementById('message').innerHTML = `<h1>You are a Premium User now</h1>`;
       downloading.style.visibility = "visible";
       oldfiledownloading.style.visibility = "visible";
       //let isadmin = decodeToken.ispremiumuser
       showLeaderboard();
    },
   };

   const rzp1 = new Razorpay(options);  //from here we are passing the options
   rzp1.open(); //this help when click on by premium the screen of razorpay frontend pops up
   e.preventDefault();

   rzp1.on('payment.failed', function(response) {
    console.log(response);
    alert('Something went wrong');                   ////when payment got failed
   })
}


function download(){
    axios.get('http://localhost:3000/user/download', { headers: {"Authorization" : token} })
    .then((response) => {
        if(response.status === 201){
            //the bcakend is essentially sending a download link
            //  which if we open in browser, the file would download
            var a = document.createElement("a");
            a.href = response.data.fileURl;     /////whatever you write in expense controller fileURl write that thing only instead of anything like fileurl or fileUrl or anything this will not work
            a.download = 'myexpense.csv';
            a.click();
        } else {
            throw new Error(response.data.message)
        }

    })
    .catch((err) => {
        showError(err)
    });
}

//Update Values  for changing income and expense number on submitting the form
async function updateValues(){ //LEts say we have four arrays means 4 transaction to every value we have to fetch out
    // const token = localStorage.getItem('token');
    let res = await axios.get(`${url4}/get-update-totalbalance`, { headers: {'Authorization': token}});
    console.log(res.data.all[0].email);
    console.log(res.data.all);

    let detail = res.data.all[0];
    try{
        const amounts = res.data.all.map((transaction) => transaction.amount);
        console.log(amounts);   //if not put headers Authorixzstion this will show undefined the no of time u get expense
         
         //now add these in variables so that we can use them
         balance.innerText=`Rs  ${detail.totalBalance}`;   //u can use $ or rupees or any currency sign
         money_plus.innerText=`Rs  ${detail.totalincome}`;
         money_minus.innerText=`Rs  ${detail.totalexpense}`;
    }
    catch(err){
        console.log(err);
    }
 }
  
async function onScreenAfterEdit(parRes){
    console.log(parRes);
    //await axios.get(`${url}/edit-expense/${ID}`)
     try{
        //console.log(res.data);
        //onScreen(res.data)
        onScreen(parRes);
        ID=''  // here id do null because when to check on conditon if(ID) in add transaction the submit should be properly done 
               ///if any new data is inserted instead of edit data
     }
     catch(err){
        console.log(err);
     }
}

//Remove Transaction
async function removeTransaction(id){  //this will do on deleting any history element according to red or green your balance adjusted by this so if delete green wala(credited from history 
    //then balance se minus ho jaega automatic if remove red wala(expense) aur=tomatic plus in your balance)
console.log(id);

  if(confirm("are You sure want to delete this entry?"))
  {
    try{

    let res = await axios.delete(`${url}/delete-expense/${id}`, { headers: {'Authorization': token}});
    removeFromScreen(id); 
  }
  catch(err){
    console.log(err);
   }
  }
}

function removeFromScreen(id){
    console.log(id);
    let parent = document.getElementById('list');
    console.log(parent);
    let child = document.getElementById(id);            ////I will remeber this how much to struggle to get this correct
    console.log(child);
    if(child){
        parent.removeChild(child);
    }
    updateValues();

    document.getElementById('text').value="";
    document.getElementById('amount').value="";
    document.getElementById('category').value="";
}

function removeFromScreenAfterEdit(id){
    console.log(id);
    let parent = document.getElementById('list');
    console.log(parent);
    let child = document.getElementById(id);            ////I will remeber this how much to struggle to get this correct
    console.log(child);
    if(child){
        parent.removeChild(child);
    }
    updateValues();
}

function editData(id,text,amount,category)
{
    document.getElementById('text').value=text;
    document.getElementById('amount').value=amount;
    document.getElementById('category').value=category;
   // document.getElementById('description').value=des;
    //document.getElementById('category').value=cat;

    removeFromScreenAfterEdit(id);
    editid(id);             // calling editid() declared above to store id of particular object to be edited
}

function showError(err){
    document.body.innerHTML+=  `<div style="color:red;">${err}</div>`;
}


let oldct;
console.log(oldct);
async function oldfiles(event) {
   
    try {
       // const token = localStorage.getItem('token')
        if (token != null && oldct === undefined) {
            //  console.log("consolelog wala",token)
            oldct = 1;
            const expense = await axios.get(`${url3}/downloadlist`, { headers: { "Authorization": token } })
                .then(response => {
                    console.log(response)
                    document.getElementById("downloadResponse").textContent += `${response.data.message}`
                    return response.data.list
                }).catch((err)=> document.getElementById("downloadResponse").textContent += `${err.response.data}`)
            //  console.log(expense)

            document.getElementById("url").innerHTML = "<label style='font-weight: 800;'>Previous Downloads</label>";
             console.log(expense);
            for (let i = 0; i < expense.length; i++) {
                document.getElementById("listofurls").innerHTML += `<li><p>${expense[i].createdAt}</p><a href=${expense[i].url}>Download</a></li>`
                //  

            }
        } 
    } catch (e) {
        console.log(e)
    }
}





const logout = document.getElementById("logout");
 logout.addEventListener("click",() => {
   let nothing="";
   localStorage.setItem('token',nothing);
   window.location.href = "../index.html";
 })
