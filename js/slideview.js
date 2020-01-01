let currentIndex = -1;
let slideshow = false;
let slideInterval = 3000; // 2s
let timeOut;

function slideView(e){
    let file = e.target;
    let fileParent = e.target.parentElement;
    let containerChildren = e.target.parentElement.parentElement.children;
    let index = getIndex(containerChildren, fileParent);
    currentIndex = index;
    if(images[index].base64Url == ''){
        getImg(images[index].path)
        .then(obj=>{
            setImageAndFileOptions(obj, file, images[index].path);
            initiateModal(index);
        });
    }else{
        initiateModal(index);
    }   
    if(!showlist){ // to close cog context menu if its opened
        toggleList();
    }
}

function fetchAndView(context=true){ // context = true(next) / false(previous)    
    let index;
    if(context){
        index = (currentIndex+1)%images.length;
    }else{
        index = (currentIndex-1)%images.length;
    }
    let file = _('files').children[index];
    file.scrollIntoView()
    if(images[index].base64Url == ''){
        let file = _('files').children[index];
        getImg(images[index].path)
        .then(obj=>{
            setImageAndFileOptions(obj, file, images[index].path);
            initiateModal(index);
        });
    }else{
        initiateModal(index);
    }
    currentIndex = index;    
    if(slideshow){
        clearTimeout(timeOut)
    }
    timeOut = setTimeout(()=>{
            if(slideshow){
                fetchAndView();
            }
        }, slideInterval);
}

function slideShow(){    
    if(slideshow){
        clearTimeout(timeOut);
        currentIndex = (currentIndex-1)%images.length;
        slideshow = false;
        _('slider').style.display = 'none';
        _('ss-download').style.display = 'block';
        _('ss').setAttribute('class','play');
    }else{
        currentIndex = (currentIndex-1)%images.length;
        slideshow = true;
        _('slider').style.display = 'block';
        _('ss-download').style.display = 'none';
        _('ss').setAttribute('class','pause');
    }
    fetchAndView();
}

function initiateModal(index){    
    _('modal-slideshow').style.display = 'block';    
    _('modal-img').style.backgroundImage = images[index].base64Url;
}

function closeModal(){
    if(slideshow){
        slideShow();
    }    
    _('modal-close-btn').parentElement.parentElement.parentElement.parentElement.style.display = 'none';
}

/** 
    Event listener for sliding images using arrow keys
 */
document.addEventListener('keydown', (event)=>{    
    if(slideshow){
        console.log("Slide true Fired : ", event.keyCode);
        if(event.keyCode == 39){ // right arrow
            fetchAndView();
        }else if(event.keyCode == 37){
            fetchAndView(false);
        }
    }

})

// let modalContainer = create('div','modal-container-bg');
    
    // let div = create('div');
    // div.style.position = 'relative';
    // div.style.width = '100%';
    // div.style.height = '100%';

    // let modalContentTop = create('div', 'model-content-top');
    
    // let closeBtn = create('div', 'modal-close-btn');
    // closeBtn.innerHTML = 'X';
    // closeBtn.onclick = function(e){
    //     closeModal(e);
    // }

    // let modalImg = create('div', 'modal-img', 'modal-img');

    // append(modalContentTop, closeBtn);
    // append(modalContentTop, modalImg);

    // let modalContentBottom = create('div', 'modal-content-bottom');

    // let modalSlide = create('div', 'modal-slide', 'modal-slide');

    // append(modalContentBottom, modalSlide);

    // append(div, modalContentTop);
    // // append(div, modalContentBottom);

    // append(modalContainer, div);

    // append(document.getElementsByTagName("body")[0], modalContainer);
