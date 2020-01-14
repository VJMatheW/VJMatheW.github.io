let observer = new IntersectionObserver( (entries, observer) => { 
    entries.forEach(entry => {
        if(entry.isIntersecting){
            let file = entry.target; 
            let path = entry.target.dataset.src;
            getImg(path)
            .then(obj=>{                                
                setImageAndFileOptions(obj, file, path);
            })     
        }                  
    });
}, {rootMargin: "0px 0px 200px 0px"});

function lazyLoad(){
    document.querySelectorAll('[data-src]').forEach(img => { observer.observe(img) });
}

function setImageAndFileOptions(obj, fileNode, path){
    let fileOpts = create('div','file-options');
    let downloadBtn = create('span', 'download');
    downloadBtn.innerHTML = "<i class='fa fa-download' aria-hidden='true'></i>";//"&#11015;";
    downloadBtn.onclick = function(){
        download(path);
    }
    append(fileOpts, downloadBtn);
    let imgData = "url(\"data:"+obj.mime+";base64, "+obj.base64.replace(/(\r\n|\n|\r)/gm, "")+"\")";                
    fileNode.style.backgroundImage = imgData;                                                

    append(fileNode.parentElement, fileOpts);

    // update images[] data
    updateImageSrc(path, imgData);
    observer.unobserve(fileNode);
}

function createFolder(folObj){
    let parent = create('div', 'folder');
    parent.title = folObj.folderName;
    parent.onclick = function(e){
        fetchDir(false,folObj);
    }

    let content = create('div', 'content');
    content.innerHTML = "&#128193;";

    let name = create('div', 'name');
    name.innerHTML = folObj.folderName;

    append(parent, content);
    append(parent, name);

    return parent;
}

function createFile(path){            
    let fileParent = create('div', 'file-parent');
    let file = create('div','file');              
    let imgData = "url(\"./ph.png\")";
    file.style.backgroundImage = imgData;
    file.setAttribute('data-src', path);
    file.onclick = (e)=>{
        slideView(e);
    }
    append(fileParent, file);
    return fileParent;
}

function createContainer(type){
    return create('div', type, type);
}

function updateDirectoryListing(obj){
    let parentContainer = _('container');
    images = [];
    if(obj.folders.length > 0 || obj.files.length > 0){
        parentContainer.innerHTML = "";
        if(obj.folders.length > 0){
            let folderCotainer = createContainer('folders');
            obj.folders.forEach(folObj => {                
                append(folderCotainer,createFolder(folObj)); 
            });
            append(parentContainer, folderCotainer);
        }

        if(obj.files.length > 0){
            let fileContainer = createContainer('files');
            append(parentContainer, fileContainer);
            obj.files.forEach(name => {   
                images.push({path: name, base64Url: ''});
                append(fileContainer, createFile(name));
            });                
            lazyLoad();
        } 
    }else{
        parentContainer.innerHTML = `<div class="empty">You havent uploaded or created any files/folders in here<div>`
    }
    moveToTop();   
}

async function download(path){ 
    if(path == ''){
        path = '/api/nostalgic/download/'+_('dowload-hq').checked+'/'+images[currentIndex].path;
    }else{
        path = '/api/nostalgic/download/'+_('dowload-hq').checked+'/'+path;
    }
    let link = await get(path)
    let a = create('a');
    a.href = baseURL+'/api/download/'+link.token;
    a.click();
}

async function updateImageSrc(path,base64Url){
    images.forEach((img, i)=>{
        if(img.path == path){
            img.base64Url = base64Url;
        }
    })
}