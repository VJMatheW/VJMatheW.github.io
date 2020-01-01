let images = [];

let displayTime = 4000;

/** Color variable */
let green = '#4CAF50';
let red = "#f44336";

function fetchFiles(){
    fetch('/api/files')
    .then(response => {
        return response.json();
    })
    .then(arr=>{
        images = arr;
        forward();                
    })
}
function backward(){
    --initvalue;    
    setImage();
}
function forward(){    
    ++initvalue;
    setImage();    
}
function setImage(){
    console.log("setting imge");
    let img = _('img');
    console.log("Setimg initvalue  : ", initvalue)
    initvalue = initvalue % images.length;    
    fetch('/api/img/'+images[initvalue])
    .then(response =>{
        return response.json();
    })
    .then(obj =>{        
        setDimension(obj.width, obj.height, obj.orientation);
        _('img').src = "data:"+obj.mime+";base64, "+obj.base64; 
        setTimeout(()=>{
            if(slideshow){
                console.log("change");
                forward();
            }
        }, 2000);       
    })
}
function setDimension(iw, ih, ori){
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    h = h - 50;
    w = w - 50;
    if(ih > iw && h > w){                
        w = h*0.6;        
    }else if(iw > ih && h > w){
        h = w*0.6;        
    }else if(w > h && ih > iw){
        w = h*0.6;
    }
    _('width').innerHTML = "Width : "+w;
    _('height').innerHTML = "Height : "+h;
    _('iw').innerHTML = "Img Width : "+iw;
    _('ih').innerHTML = "Img Height : "+ih;
    _('ori').innerHTML = "Orientation : "+ori;    
    _('img').height = Math.min(ih, h);
    _('img').width = Math.min(iw, w);
}

/**
    func to set files and folders
 */
function fetchDir(e,folObj=""){
    observer.disconnect(); // release all target from watching   
    // controller.abort(); 
    let apiEndPoint = '';
    
    if(!isSignedIn()){ // check signedin and redirect to login
        redirect('/signin.html'+getCurrentURIFol());
    }
    
    if(getCurrentURIFol() !== ''){
        folObj = {};
        folObj['encodedPath'] = (getCurrentURIFol()).replace('#','');
    }

    if(folObj == ""){
        apiEndPoint = '/api/nostalgic/listing';
    }else{
        apiEndPoint = '/api/nostalgic/listing/'+folObj.encodedPath;        
    }

    get(apiEndPoint)
    .then(obj=>{          
        currentDirPath = obj.path;      
        updateDirectoryListing(obj);
        updateRoute(e, folObj);
    })
}

/** Func to parse foldername from url */
function getCurrentURIFol(){
    let url = window.location.href;
    if(url.includes('#')){ // for public sharing
        let arr = url.split('#');
        return '#'+arr[1]
    }
    return '';
}

/** Func to clear shared fold from URL to nav to Home Page without redirect */
function clearSharedFolder(){
    let url = window.location.href;
    if(url.includes('#')){ // for public sharing
        let arr = url.split('#');
        window.location.href = arr[0];
    }
}

/**
    func to update the path on the top
 */
function updateRoute(e, folObj){
    if(e){
        let index = Array.prototype.slice.call(e.target.parentElement.children).indexOf(e.target);
        let children = e.target.parentElement.children;
        for(i=children.length-1; i>=(index+1); i--){  // removed from reverse because when one node removed length decreases
            children[i].remove();
        }
    }else{
        if(folObj && folObj.folderName){
            let span = create('span', ' route');
            span.innerHTML = '/'+ folObj.folderName;
            span.onclick = function(e){
                fetchDir(e, folObj);
            }
            append(_('routes'), span);
        }        
    }
}

/**
    function on home btn on-click
 */
function clearRoute(){
    _('routes').innerHTML = "";
    clearSharedFolder();
    fetchDir();
}

/**
    back to top btn func
 */
function moveToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

/**
    make top bae sticky & hide or display back to top btn
 */
window.onscroll = function() {
    let backToTopBtn = _("back-to-top-btn");
    let path = _('path');
    if(document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
        path.style.position = "fixed";
    }else{
        path.style.position = "relative";
    }
    if(document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        backToTopBtn.style.display = "block";
    }else{
        backToTopBtn.style.display = "none";
    }    
};

/**
    Hide or display + context menu
 */
let showlist = true;

function toggleList(){
    if(showlist){
        show();
        showlist = false;
        setTimeout(()=>{close();}, displayTime);
    }else{
        close();
        showlist = true;
    }
}
function show(e){
    let list = _('list');
    _('listbtn').innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
    list.style.height = '140px';
}
function close(e){
    let list = _('list');
    _('listbtn').innerHTML = '<i class="fa fa-cog" aria-hidden="true"></i>';
    list.style.height = '0px';
}
function upload(){
    _('file').click();
    toggleList();
}

/**
    Function to upload files and show progress
 */

let toggleUploadProgressState = false;

function uploadFiles(e){
    console.log("change event triggered");
    let promArr = [];
    let files = e.target.files;
    console.log("files array", files);
    let size = ()=>{
        let byet = 0;
        for(i=0;i<files.length;i++){
            byet = byet + files[i].size;
        }
        return Math.ceil(((byet/1024)/1024));
    }
    let decision = false;
    if(files.length > 0){
        decision = confirm("Sure ! You want to upload "+files.length+" file(s) of about "+size()+"MB");
    }
    let uploads = _('uploads');
    if(decision){
        toggleUploadProgress();
        _('upload-head-text').innerHTML = 'Uploading '+files.length+' items';
        uploads.style.display = 'block';
        for(i=0;i<files.length;i++){
            let uploadsItem = createUploadsItem(files[i].name);
            append(_('uploads-items'), uploadsItem);
            promArr.push(
                readFileAsDataURL(files[i])
                .then(file=>{
                    file['path'] = currentDirPath;
                    return postAjax('/api/nostalgic/upload', file, uploadsItem);
                })
            )
        }
        Promise.all(promArr)
        .then(arrr=>{
            // close the dialog goes here
            _('upload-head-text').innerHTML = 'Upload Completed';
            showNotification('Upload Successful... Your uploads will be available soon :) ');
            setTimeout(()=>{
                toggleUploadProgressState = false;
                _('uploads-items').innerHTML = '';
                uploads.style.display = 'none';
                // display modal here
            }, displayTime);
        })
        .catch(err=>{
            alert('Error Occurred !!');
            _('upload-head-text').innerHTML = 'Error Occured';
            showWarning('Error Occured :(  <br> Err : '+err);
            setTimeout(()=>{
                toggleUploadProgressState = false;
                _('uploads-items').innerHTML = '';
                uploads.style.display = 'none';
                // display modal here
            }, displayTime);
        })
    }else{
        alert('Upload aborted !!');
    }
}

async function uploadFilesSequentially(e){
    let files = e.target.files;
    console.log("files array", files);
    let size = ()=>{
        let byet = 0;
        for(i=0;i<files.length;i++){
            byet = byet + files[i].size;
        }
        return Math.ceil(((byet/1024)/1024));
    }
    let decision = false;
    if(files.length > 0){
        decision = confirm("Sure ! You want to upload "+files.length+" file(s) of about "+size()+"MB");
    }
    let uploads = _('uploads');
    if(decision){
        try{
            toggleUploadProgress();
            _('upload-head-text').innerHTML = 'Uploading '+files.length+' items';
            uploads.style.display = 'block';

            for(i=0;i<files.length;i++){
                let id = Date.now();
                let uploadsItem = createUploadsItem(files[i].name, id);
                prepend(_('uploads-items'), uploadsItem);
                let file = await readFileAsDataURL(files[i])
                file['path'] = currentDirPath;
                let postResponse = await postAjax('/api/nostalgic/upload', file, uploadsItem)
            }            
            // close the dialog goes here
            _('upload-head-text').innerHTML = 'Upload Completed';
            showNotification('Upload Successful... Your uploads will be available soon :) ');
            setTimeout(()=>{
                toggleUploadProgressState = false;
                _('uploads-items').innerHTML = '';
                uploads.style.display = 'none';
                // display modal here
            }, displayTime);

        }catch(err){
            console.log("Upload Error : ",err);
            alert('Error Occurred !!');
            _('upload-head-text').innerHTML = 'Error Occured';
            showWarning('Error Occured :(  <br> Err : '+err);
            setTimeout(()=>{
                toggleUploadProgressState = false;
                _('uploads-items').innerHTML = '';
                uploads.style.display = 'none';
            }, displayTime);
        }
    }else{
        alert('Upload aborted !!');
    }
}

/** Func to create progress bar inside the Uploads container */
function createUploadsItem(fileName='not specified', id){
    let uploadsItem = create('div','uploads-item', id);
    
    let name = create('div', 'filename');
    name.innerHTML = fileName;
    
    let progress = create('progress', 'progress');
    progress.value = '0';
    progress.max = '100';
    
    append(uploadsItem, name);
    append(uploadsItem, progress);

    return uploadsItem;
}

function toggleUploadProgress(e){
    let ele = _('upload-head-btn');
    if(toggleUploadProgressState){
        toggleUploadProgressState = false;
        ele.innerHTML = '<i class="fa fa-chevron-up" aria-hidden="true"></i>';
        _('uploads-items').style.height = '0px';
    }else{
        toggleUploadProgressState = true;
        ele.innerHTML = '<i class="fa fa-chevron-down" aria-hidden="true"></i>';
        _('uploads-items').style.height = '160px';
    }
}

/**
    Function to Toggle NewFolder Options
 */
let switchNewFolderModal = false;

function toggleNewFolderModal(){
    if(switchNewFolderModal){
        switchNewFolderModal = false;              
        _('folName').value = '';  
        _('modal-newfolder').style.display = 'none';
    }else{
        switchNewFolderModal = true;
        toggleList();
        _('modal-newfolder').style.display = 'block';
    }
}

function createNewFolder(){
    let name = _('folName').value.trim();
    if(name.length > 0 && (/^[a-zA-Z].+/gi).test(name) ){ // && check for valid folder name or not            
        let postData = {
            name : name,
            base : currentDirPath
        }
        post('/api/nostalgic/newfolder', postData)
        .then(res=>{
            if(res.status){                    
                // appending folder to container
                let parentContainer = _('container');
                let folderCotainer = _('folders');
                if(!folderCotainer){
                    folderCotainer = createContainer('folders');
                    prepend(parentContainer, folderCotainer);
                }
                prepend(folderCotainer, createFolder({folderName: res.folderName, encodedPath: res.encodedPath}));
                toggleNewFolderModal();
            }else{
                alert('Creation of folder failed');
            }
        })
        .catch(err=>{
            toggleNewFolderModal();
        })
    }else{
        // do something
        alert("FolderName cannot be Empty | Should start with a letter")
    }
}

/**
    Function to display notification and warning
 */
function showNotification(content, justShowHide=true){
    _('notification-content').innerHTML = content;
    _('notification-container').style.backgroundColor = green;
    _('notification-container').style.right = '10px';
    if(justShowHide){
        setTimeout(()=>{
            _('notification-container-close').click();        
        }, displayTime);
    }    
}
function showWarning(content, justShowHide=true){
    _('notification-content').innerHTML = content;
    _('notification-container').style.backgroundColor = red;
    _('notification-container').style.right = '10px';
    if(justShowHide){
        setTimeout(()=>{
            _('notification-container-close').click();        
        }, displayTime);
    }
}

/** 
    Function to toggle SignIn & SignUp Card
 */
function toggleCard(e){
    let el = e.target;
    let elements = el.parentElement.children;
    for(i=0; i< elements.length; i++){
        elements[i].classList.remove('card-head-active');
    }
    el.classList.add('card-head-active');
    if(el.innerHTML.toLowerCase().includes('in')){
        _('signin').style.display = 'block';
        _('signup').style.display = 'none';
        _('otp-card').style.display = 'none';
    }else{
        _('signin').style.display = 'none';
        _('signup').style.display = 'block';
        _('otp-card').style.display = 'none';
    }
}