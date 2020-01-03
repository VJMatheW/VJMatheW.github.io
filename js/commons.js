const controller = new AbortController();
// signal to pass to fetch
const signal = controller.signal;

// let baseURL = 'http://colorhomes.ddns.net:8081';
// let baseURL = 'http://192.168.1.57:5000';
let baseURL = 'http://localhost:5000';

let currentDirPath = 'MA==';

function _(id){
    return document.getElementById(id);
}

function __(cls){
    return document.getElementsByClassName(cls);
}

function get(url, headers, data={}){    
    let status;
    return fetch(baseURL+url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+retrive('token')
        },
        signal: signal
    })
    .then(res=>{
        status = res.status
        return res.json();
    })
    .then(obj=>{
        if(status == 200){
            return obj;
        }
        showWarning(obj.error)
        return;
    })
    .catch(err=>{
        if(err == 'TypeError: Failed to fetch'){
            showWarning('Sorry... Our Servers are down. <br>Please try after some time.');
        }
    });
}

function getImg(url, headers){
    let status;
    return fetch(baseURL+"/api/nostalgic/img/"+url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+retrive('token')
        },
        signal: signal
    })
    .then(res=>{ 
        status = res.status
        return res.json();
    })
    .then(obj=>{
        if(status == 422){
            showWarning(obj.error)
            return;
        }
        return obj;
    })
    .catch(err=>{
        if(err == 'TypeError: Failed to fetch'){
            showWarning('Sorry... Our servers are down. <br> Please try after some time !!!');
        }else{
            showWarning(err)
        }
    });
}

function post(url, data){
    let statuscode;
    return fetch(baseURL+url, {
            method: 'post',
            mode: 'no-cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+retrive('token'),
            // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify(data) // body data type mu
        })
        .then(res=>{ 
            statuscode = res.status  
            return res.json()          
        })
        .then(obj=>{
            if(statuscode == 201 || statuscode == 200){
                return obj;
            }else if(statuscode == 403){
                _('u_id').value = obj.u_id;
                _('signin').style.display = 'none';
                _('otp-card').style.display = 'block';
            }else{
                showWarning(obj.error)                
            }
        })
        .catch(err=>{
            if(err == 'TypeError: Failed to fetch'){
                showWarning('Sorry... Our Servers are down. <br> Please try after sometime !!!');
            }
        });
}

function postAjax(url, data, ref, contentType='application/json'){    
    return new Promise((resolve, reject)=>{            
        var xmlhttp = null;                
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.upload.addEventListener("progress", progressHandler.bind(null, event, ref), false);
        xmlhttp.addEventListener("load", completeHandler.bind(null, event, ref), false);
        xmlhttp.addEventListener("error", errorHandler.bind(null, event, ref), false);
        xmlhttp.addEventListener("abort", abortHandler.bind(null, event, ref), false);
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && (this.status == 200 || this.status == 201)) { // 401 unauhtorized auth possible  || 403 Forbidden (Similar to 401 but no auth possible)
                let res = JSON.parse(this.responseText);
                resolve(res);
            }else if(this.readyState == 4 && (this.status == 500 || this.status == 404)){
                reject('Error code : ', this.status);
            }
        }
        xmlhttp.open('POST', baseURL+url, true);
        xmlhttp.setRequestHeader('Content-type', contentType);
        xmlhttp.setRequestHeader('Authorization', 'Bearer '+retrive('token'));
        xmlhttp.send(JSON.stringify(data));
    });
}

/**
    handler's for postAjax
 */
function progressHandler(e, ref){
    if(ref){
        let percent = Math.ceil((e.loaded/e.total)*100);
        ref.children[1].value = percent;
    }
}  

function completeHandler(e, ref){
    if(ref){
        ref.children[1].classList.remove('progress');
        ref.children[1].classList.remove('progress-error');
        ref.children[1].classList.add('progress-complete');
    }
}

function errorHandler(e, ref){
    if(ref){
        ref.children[1].classList.remove('progress');
        ref.children[1].classList.remove('progress-complete');
        ref.children[1].classList.add('progress-error');
    }
}

function abortHandler(e, ref){
    if(ref){
        ref.children[1].classList.remove('progress');
        ref.children[1].classList.remove('progress-complete');
        ref.children[1].classList.add('progress-error');
    }
}
/** Handler ends here  */

function create(tag, classname="", id="", name=""){
    var el = document.createElement(tag);        
    if(id != ""){
        el.id = id;
    }    
    if(classname != ""){
        el.className = classname;
    }
    if(name != ""){
        el.name = name;
    }
    return el;
}

function createImg(classname="",id="",src="",height="",width=""){
    var img = document.createElement("img");
    img.src = src;
    if(classname != ""){
        img.className = classname;
    }    
    if(height != ""){
        img.height = height;
    }
    if(width != ""){
        img.width = width;
    }        
    return img;
}

function append(src, dest){
    src.appendChild(dest);
    return src;
}

function prepend(parent, child){
    parent.prepend(child);
    return parent;
}

function readFileAsDataURL(file){
    return new Promise((resolve, reject)=>{  
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(){
            let dataUrl = reader.result;
            resolve({name: file.name, type: file.type, base64:dataUrl});
        }
        reader.onerror = function(){
            reject('File not read properly');
        }
    });
}

function getIndex(container, child){
    return Array.prototype.slice.call(container).indexOf(child);
}

/** Google OAuth Btn design */
var googleUser = {};
var startApp = function() {
    gapi.load('auth2', function(){
        // Retrieve the singleton for the GoogleAuth library and set up the client.
        auth2 = gapi.auth2.init({
            client_id: '31080687314-knp23rh0cssh7mg3nmailnp3nudl21b1.apps.googleusercontent.com',
            cookiepolicy: 'single_host_origin',
            // Request scopes in addition to 'profile' and 'email'
            //scope: 'additional_scope'
        });
        attachSignin(document.getElementById('customBtn'));
    });
};

function attachSignin(element) {
    console.log(element.id);
    auth2.attachClickHandler(element, {},
       async function(googleUser) {
            // alert("Valid google user", googleUser);
            let id_token = googleUser.getAuthResponse().id_token;
            console.log("TOKEN : ", id_token);
            let data = {
                'id_token': id_token,
                'clientId': clientUnique
            }
            let res = await post('/auth/signin', data);
            if(!res){
                return;
            }
            storeToken(res)
            if(window.location.href.includes('#')){
                redirect(window.location.href);
            }else{
                redirect('')
            }
        }, function(error) {
            // alert(JSON.stringify(error, undefined, 2));
        });
}


/** Sanitation work */
function isMobileNo(str){
    if(str.match(/^\d{10}$/)){
        return true;
    }else{
        return false;
    }
}

function isOtp(str){
    if(str.match(/^\d{6}$/)){
        return true;
    }else{
        return false;
    }
}

function isPassword(str){
    if(str.match(/^[A-Za-z0-9_]\w{7,14}$/)){
        return true;
    }else{
        return false;
    }
}

function isText(str){
    if(str.match(/^[A-Za-z\ ]+$/)){
        return true;
    }else{
        return false;
    }
}

function sanitize(obj){    
    let error = [];
    for (let [key, value] of Object.entries(obj)) {
        switch(key){
            case 'mobile_no':
                if(!isMobileNo(obj[key])){
                    error.push('Mobile No should be of 10 digits');
                }
                break;
            case 'password':                
                if(!isPassword(obj[key])){
                    error.push('Password should be between 7 to 16 characters which contain only characters, numeric digits, underscore');
                }
                break;
            case 'password1':
                if(!isPassword(obj[key])){
                    if(obj[key] !== obj['password']){
                        error.push('Passwords do not match');
                    }
                }
            case 'name':
                if(!isText(obj[key])){
                    error.push('Name can contain only Alphabetic characters');                    
                }
                break;
            case 'otp':
                if(!isOtp(obj[key])){
                    error.push('OTP should contain only numbers and of 6 digits ')
                }
                break;
            default: 
                console.log("Nothing found");
                break;
        }
    }
    return error;
}

/** Access local storage */
function store(key, value){
    localStorage.setItem(key, value);
}

function retrive(key){
    return localStorage.getItem(key);
}

function appendToken(){
    let temp = {
        "clientId": retrive('clientId'),
        "token": retrive('token'),
        "uid": retrive('uid')
    }
    return temp;
}

function isSignedIn(){
    if(retrive('uid') == null){
        return false
    }else{
        return true
    }
}

/* Notification Container Close */
_('notification-container-close').addEventListener('click', ()=>{
    _('notification-container').style.right = '-310px';
})

/** Redirect to specified path */
function redirect(uri=''){
    console.log("URI", uri);
    if(uri == ''){        
        window.location.replace('/')
    }else{
        var url = uri
        if(url.includes('#')){
            let arr = url.split('#')
            let newUrl = `/${arr[2]}#${arr[1]}`
            console.log(newUrl)
            window.location.replace(newUrl)
        }else{
            console.log('elsepart')
            window.location.replace(uri)
        }
    }    
}