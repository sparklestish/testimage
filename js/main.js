
var serverURL = "http://moneyboxapp.envisiongh.net/test-database/";  // please change this to your server address.


var file;          /* this will save the image file when the user selects input from files*/
var isFromCamera;  /* a flag to indicate that the file is from the camera */
var imageSavedURI; /* this saves the image URI for uploading when using the camera */
var username;      /* hold the name of the user */


/**
 * This is called when we load an image from the files.
 *
 * We then save this image to the global variable and 
 * we will use it later when uploading the file.
 *  
 * Note that we still save its URI inorder to pass it to 
 * the canvas for reviewing.
 *
 */
function loadFromFiles(event) {

    var fileInput = event.target.files; // get the input files
    if (fileInput.length > 0) { // check if we have at least one file
        isFromCamera = false;
        file = event.target.files[0]; // save to the global variable the file we need.
        var windowURL = window.URL || window.webkitURL;
        imageSavedURI = windowURL.createObjectURL(fileInput[0]);
        
        enableContinue(); // finally enable the user to continue to review page.
    }
}

/**
 * This function will allow us to get the picture from the camera.
 * 
 * We then get the image's URI and save it in the global variable
 * since we will need it for further uploading the file.
 *
 * In case of an error, we display the error message.
 *
 */
function takePicture() {
    navigator.camera.getPicture( 
        function( imageURI ) {
            isFromCamera = true;
            imageSavedURI = imageURI;
            enableContinue(); // enable the user to continue
        },
        function(message) {
            alert(message);
        },
        {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            sourceType: Camera.PictureSourceType.CAMERA
        }
    );
}

/**
 * This function is used to draw the image gotten from the
 * user through the saved URI. 
 *
 */
function drawImage (imageURI) {
    var photoCanvas = document.getElementById("image-canvas");
    var ctx = photoCanvas.getContext("2d");
    var photo = new Image();
    photo.onload = function() {
        photoCanvas.height = photo.height;
        photoCanvas.width = photo.width;
        ctx.drawImage(photo, 0, 0, photo.width, photo.height);
    }
    photo.src = imageURI;
}

/**
 * This simply allows the user to continue when they have chosen
 * the image.
 *
 */
function enableContinue() {
    document.getElementById("continue-btn").style.display = "inline-block";
}

/**
 * This is the main function responsible of uploading the image to the server.
 * 
 * Note that it first checks if the image we have is gotten from the camera
 * or the folder (using the isFromCamera flag).
 * 
 * If gotten from the camera, then we need to use the imageSavedURI to uplaod
 * the image. 
 *
 * If from file, we then use the file global variable. We use a FormData object
 * to upload the file using ajax.
 * 
 */
function uploadPhoto(){
    if (isFromCamera == true) {
        var ft = new FileTransfer();
        var options = new FileUploadOptions();

        options.fileKey = "image";
        // we use the file name to send the username
        options.fileName = "filename.jpg"; 
        options.mimeType = "image/jpeg";
        options.chunkedMode = false;
        options.params = { 
            "username": username
        };

        ft.upload(imageSavedURI, encodeURI(serverURL + "upload.php"),
            function (e) {
                alert("Image uploaded");
            },
            function (e) {
                alert("Upload failed");
            }, 
            options
        );
    } else {
        var formdata = new FormData();
        formdata.append("image", file);
        formdata.append("username", username);
        var ajax = new XMLHttpRequest();
        ajax.upload.addEventListener("progress", progressHandler, false);
        ajax.addEventListener("load", completeHandler, false);
        ajax.addEventListener("error", errorHandler, false);
        ajax.addEventListener("abort", abortHandler, false);
        ajax.open("POST", serverURL + "upload.php");
        ajax.send(formdata);
    }
}
/**
 * The following are utility functions for use with ajax when 
 * uploading the image.
 */
//============================================================================
function progressHandler(event){
    var percent = (event.loaded / event.total) * 100;
    if (percent == 100)
        alert("Image uploaded");
}
function completeHandler(event){
    alert(event.target.responseText);
}
function errorHandler(event){
    alert("Upload Failed");
}
function abortHandler(event){
    alert("Upload Aborted");
}
//============================================================================

/**
 * This is just a utility function that creates the review page when
 * continue is pressed.
 *
 */
function loadReviewPage() {
    username = document.getElementById("username").value;
    if (username == "") {
        alert("Please provide a valid name");
        return;
    }

    var inputForm = document.getElementById("input-form");
    var currentPage = document.getElementById("current-page");
    inputForm.removeChild(currentPage);

    var newPage = document.createElement("div");
    newPage.setAttribute("id", "current-page");
    var title = document.createElement("h3");
    title.setAttribute("class", "w3-text-teal");
    title.setAttribute("style", "font-style: italic; text-decoration: underline");
    var titleText = document.createTextNode("Review Input");
    title.appendChild(titleText);
    newPage.appendChild(title);

    var name = document.createElement("h4");
    name.setAttribute("class", "w3-text-teal");
    var nameText = document.createTextNode("Name: " + username);
    name.appendChild(nameText);
    newPage.appendChild(name);

    var canvas = document.createElement("canvas");
    canvas.setAttribute("id", "image-canvas");
    newPage.appendChild(canvas);
    inputForm.appendChild(newPage);
    drawImage(imageSavedURI);

    var submitButton = document.createElement("button");
    submitButton.setAttribute("class", "w3-btn w3-orange fileUpload");
    submitButton.setAttribute("style", "margin: 10px;");
    submitButton.setAttribute("onclick", "uploadPhoto()");
    var submitButtonText = document.createTextNode("Submit");
    submitButton.appendChild(submitButtonText);
    inputForm.appendChild(submitButton);
}